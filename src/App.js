import React, { useState, useEffect } from "react";
import wordLists from "./discovery_k12_spelling_5th_grade.json";
import "./spellingQuizStyles.css";

export default function App() {
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const savedWeek = localStorage.getItem("selectedWeek");
    return savedWeek ? parseInt(savedWeek) : null;
  });
  const [answers, setAnswers] = useState(() => {
    const savedAnswers = localStorage.getItem("answers");
    return savedAnswers ? JSON.parse(savedAnswers) : Array(15).fill("");
  });
  const [submitted, setSubmitted] = useState(() => {
    return localStorage.getItem("submitted") === "true";
  });
  const [score, setScore] = useState(0);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [practiceMode, setPracticeMode] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });
  const [wordDetails, setWordDetails] = useState({}); // for storing definitions/examples
  const [showFullList, setShowFullList] = useState(false);

  useEffect(() => {
    localStorage.setItem("selectedWeek", selectedWeek);
    localStorage.setItem("answers", JSON.stringify(answers));
    localStorage.setItem("submitted", submitted);
    localStorage.setItem("darkMode", darkMode);
  }, [selectedWeek, answers, submitted, darkMode]);

  const handleWeekChange = (e) => {
    const weekNum = parseInt(e.target.value);
    setSelectedWeek(weekNum);
    setAnswers(Array(15).fill(""));
    setSubmitted(false);
    setScore(0);
    setWordDetails({});
  };

  const handleInputChange = (index, value) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const weekData = wordLists.weeks.find(function (w) {
      return w.week === selectedWeek;
    });
    let newScore = 0;
    answers.forEach(function (a, i) {
      if (a.trim().toLowerCase() === weekData.words[i].toLowerCase()) {
        newScore++;
      }
    });
    setScore(newScore);
    playSound(newScore >= 10 ? "correct" : "wrong");
  };

  const playSound = (type) => {
    const audio = new Audio(
      type === "correct" ? "/sounds/correct.mp3" : "/sounds/wrong.mp3"
    );
    audio.play();
  };

  const speak = (word) => {
    const msg = new SpeechSynthesisUtterance(word);
    msg.rate = rate;
    msg.pitch = pitch;
    speechSynthesis.speak(msg);
  };

  const fetchDefinition = (word) => {
    if (wordDetails[word]) {
      alert(
        word + "\n\n" + wordDetails[word].definition + "\n\nExample: " + wordDetails[word].example
      );
      return;
    }

    fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + word)
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        if (Array.isArray(data)) {
          const def = data[0].meanings[0].definitions[0].definition;
          const example = data[0].meanings[0].definitions[0].example || "No example.";
          const updated = Object.assign({}, wordDetails);
          updated[word] = { definition: def, example: example };
          setWordDetails(updated);
          alert(word + "\n\n" + def + "\n\nExample: " + example);
        } else {
          alert("Definition not found.");
        }
      })
      .catch(function () {
        alert("Error fetching definition.");
      });
  };

  const autoPronounce = () => {
    const weekData = wordLists.weeks.find(function (w) {
      return w.week === selectedWeek;
    });
    if (!weekData) return;
    let i = 0;
    const interval = setInterval(function () {
      if (i < weekData.words.length) {
        speak(weekData.words[i]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 2500);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleDarkMode = () => {
    const body = document.body;
    if (body.classList.contains("dark")) {
      body.classList.remove("dark");
    } else {
      body.classList.add("dark");
    }
  };

  const printWordList = () => {
    const weekData = wordLists.weeks.find(function (w) {
      return w.week === selectedWeek;
    });
    if (!weekData) return;

    let output = "Spelling List - Week " + weekData.week + "\n\n";
    weekData.words.forEach(function (word, i) {
      const def = wordDetails[word] ? wordDetails[word].definition : "";
      const example = wordDetails[word] ? wordDetails[word].example : "";
      output += i + 1 + ". " + word + "\nDefinition: " + def + "\nExample: " + example + "\n\n";
    });

    const newWin = window.open("", "_blank");
    if (newWin) {
      newWin.document.write("<pre>" + output + "</pre>");
      newWin.print();
    }
  };

  const weekData = wordLists.weeks.find(function (w) {
    return w.week === selectedWeek;
  });

  return (
    <div className="container">
      <div className="header">
        <h1>✨ Spelling Galaxy ✨</h1>
        <div className="options">
          <button
            onClick={function () {
              setDarkMode(!darkMode);
              toggleDarkMode();
            }}
          >
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>

          <label>
            <input
              type="checkbox"
              checked={practiceMode}
              onChange={function () {
                setPracticeMode(!practiceMode);
              }}
            />
            Practice Mode 🎓
          </label>

          {practiceMode && (
            <>
              <button onClick={autoPronounce}>🔊 Auto-Pronounce All</button>
              <button onClick={function () {
                setShowFullList(!showFullList);
              }}>
                📖 Show Word List
              </button>
              <button onClick={printWordList}>🖨️ Print</button>
            </>
          )}
        </div>
        <div className="sliders">
          <label>Rate: {rate}</label>
          <input type="range" min="0.5" max="2" step="0.1" value={rate} onChange={function (e) { setRate(parseFloat(e.target.value)); }} />
          <label>Pitch: {pitch}</label>
          <input type="range" min="0" max="2" step="0.1" value={pitch} onChange={function (e) { setPitch(parseFloat(e.target.value)); }} />
        </div>
        <select value={selectedWeek || ""} onChange={handleWeekChange}>
          <option value="">Select a Week</option>
          {wordLists.weeks.map(function (w) {
            return (
              <option key={w.week} value={w.week}>
                Week {w.week}
              </option>
            );
          })}
        </select>
      </div>

      {weekData && (
        <form
          onSubmit={function (e) {
            e.preventDefault();
            handleSubmit();
          }}
          className="quiz-form"
        >
          <h2>Week {weekData.week} Quiz</h2>
          {weekData.words.map(function (word, i) {
            return (
              <div className="word-box" key={i}>
                <label>Word #{i + 1}</label>
                <input
                  type="text"
                  value={answers[i]}
                  onChange={function (e) {
                    handleInputChange(i, e.target.value);
                  }}
                  disabled={submitted && !practiceMode}
                />
                <button type="button" onClick={function () { speak(word); }}>🔊</button>
                <button type="button" onClick={function () { fetchDefinition(word); }}>📖</button>
                {practiceMode && <p className="helper">Answer: {word}</p>}
                {submitted && !practiceMode && (
                  <p className={answers[i].trim().toLowerCase() === word.toLowerCase() ? "correct" : "wrong"}>
                    {answers[i].trim().toLowerCase() === word.toLowerCase() ? "✅ Correct" : "❌ " + word}
                  </p>
                )}
              </div>
            );
          })}

          {!practiceMode && !submitted && (
            <button type="submit" className="submit-btn">Submit Quiz</button>
          )}
          {!practiceMode && submitted && (
            <div className="score-box">
              <p>🎉 Score: {score} / 15</p>
            </div>
          )}
        </form>
      )}

      {showFullList && weekData && (
        <div className="word-list">
          <h3>Full Word List – Week {weekData.week}</h3>
          {weekData.words.map(function (word, i) {
            const details = wordDetails[word];
            return (
              <div key={i} className="list-item">
                <strong>{i + 1}. {word}</strong>
                <p>Definition: {details ? details.definition : "Not loaded yet"}</p>
                <p>Example: {details ? details.example : "Not loaded yet"}</p>
              </div>
            );
          })}
        </div>
      )}

      <button onClick={scrollToTop} className="to-top-btn">▲</button>
    </div>
  );
}
