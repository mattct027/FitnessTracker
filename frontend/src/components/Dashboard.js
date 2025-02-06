import React, {
  useState,
  useEffect
} from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../styles/Dashboard.css";
import Home from "./Home";

const HomePage = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [isSignedOut, setIsSignedOut] = useState(false);
  const [workoutDates, setWorkoutDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startingWeight, setStartingWeight] = useState(70);
  const [currentUserWeight, setCurrentUserWeight] = useState(70);
  const [newWeightInput, setNewWeightInput] = useState("");
  const [workoutInProgress, setWorkoutInProgress] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState(new Date());
  const [exercises, setExercises] = useState([]);
  const [currentExercise, setCurrentExercise] = useState("");
  const [currentMuscleGroup, setCurrentMuscleGroup] = useState("");
  const [currentEquipmentType, setCurrentEquipmentType] = useState("");
  const [workoutName, setWorkoutName] = useState("");
  const [notes, setNotes] = useState("");
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [cardioExercises, setCardioExercises] = useState([]);
  const [cardioHistory, setCardioHistory] = useState([]);
  const [isEditingWorkout, setIsEditingWorkout] = useState(null);

  useEffect(() => {
      const savedStartingWeight = localStorage.getItem("startingWeight");
      const savedCurrentUserWeight = localStorage.getItem("currentUserWeight");

      if (savedStartingWeight) setStartingWeight(Number(savedStartingWeight));
      if (savedCurrentUserWeight) setCurrentUserWeight(Number(savedCurrentUserWeight));
  }, []);

  useEffect(() => {
      localStorage.setItem("startingWeight", startingWeight);
  }, [startingWeight]);

  useEffect(() => {
      localStorage.setItem("currentUserWeight", currentUserWeight);
  }, [currentUserWeight]);

  const handleStartingWeightUpdate = () => {
      if (newWeightInput) {
          setStartingWeight(Number(newWeightInput));
          setNewWeightInput("");
      }
  };

  const handleCurrentWeightUpdate = () => {
      if (newWeightInput) {
          setCurrentUserWeight(Number(newWeightInput));
          setNewWeightInput("");
      }
  };

  const resetWorkoutHistory = () => {
      // setWorkoutHistory([""]);
      setCardioHistory([]);
  };

  const handleRetrieveSets = async (e) => {
    const userData = JSON.parse(localStorage.getItem('user_data'));
    if (!userData || !userData.id) {
        alert('User not logged in.');
        return;
    }

    var obj = { userId: userData.id };
    var js = JSON.stringify(obj);

    try {
        const response = await fetch('https://largeproject.mattct027.xyz/api/retrieve-set', {
            method: 'POST',
            body: js,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        var res = await response.json();

        if (res.error && res.error.length > 0) {
            alert(res.error);
        } else {
            console.log(res.sets);

            const mappedWorkouts = res.sets
            .filter(workout => Array.isArray(workout.Exercises))
            .map(workout => ({
              exercises: workout.Exercises.filter(exercise => Array.isArray(exercise.sets)).map(exercise => ({
                ...exercise,
                sets: exercise.sets.map(set => ({
                  weight: parseInt(set.weight, 10),
                  reps: parseInt(set.reps, 10),
                })),
              })),
              notes: "",
            }));

            setWorkoutHistory([...workoutHistory, ...mappedWorkouts]);         
        }
    } catch (err) {
        alert('Error occurred: ' + err.toString());  
    }
  };


  const signOut = () => {
      localStorage.removeItem("user_data");
      setIsSignedOut(true);
  };

  const handleTabClick = (tab) => {
      setActiveTab(tab);
  };

  useEffect(() => {
      const savedWorkoutDates = JSON.parse(localStorage.getItem("workoutDates")) || [];
      setWorkoutDates(savedWorkoutDates);
  }, []);

  useEffect(() => {
      localStorage.setItem("workoutDates", JSON.stringify(workoutDates));
  }, [workoutDates]);

  const handleDateClick = (date) => {
      const dateString = date.toDateString();
      if (!workoutDates.includes(dateString)) {
          setWorkoutDates([...workoutDates, dateString]);
      } else {
          setWorkoutDates(workoutDates.filter((d) => d !== dateString));
      }
  };

  const handleStartWorkout = async (e) => {
      e.preventDefault();
      setWorkoutInProgress(true);
      setExercises([]);
      setNotes("");

      var obj = {
          setName: "NewWeightTraining",
          exercises: exercises,
          userId: JSON.parse(localStorage.getItem('user_data')).id
      };
      var js = JSON.stringify(obj);

      try {
          const response = await fetch('https://largeproject.mattct027.xyz/api/create-set', {
              method: 'POST',
              body: js,
              headers: {
                  'Content-Type': 'application/json'
              }
          });

          var res = JSON.parse(await response.text());

          if (res.error.length <= 0) {
              // Workout/set successfully created
          } else {
              alert(res.error);
          }
      } catch {
          alert(e.toString);
      }
  };

  const handleCancelWorkout = async (e) => {
      e.preventDefault();
      if (window.confirm("Are you sure you want to cancel this workout? All progress will be lost.")) {
          setWorkoutInProgress(false);
          setExercises([]);
          setNotes("");

          var obj = {
              setName: "NewWeightTraining"
          };
          var js = JSON.stringify(obj);

          try {
              const response = await fetch('https://largeproject.mattct027.xyz/api/delete-set', {
                  method: 'POST',
                  body: js,
                  headers: {
                      'Content-Type': 'application/json'
                  }
              });

              var res = JSON.parse(await response.text());

              if (res.error.length <= 0) {
                  // Workout/set successfully deleted
                  alert(res.message);
              } else {
                  alert(res.error);
              }
          } catch {
              alert(e.toString);
          }
      }
  };

  const handleFinishWorkout = async (e) => {
      e.preventDefault();

      const name = prompt("Please enter a name for your workout:");

      if (!name) {
          alert("Workout name is required.");
          return;
      }

      const completedWorkout = {
        name: name,
        exercises,
        notes,
    };
  
      setWorkoutName(name);
      setWorkoutHistory([...workoutHistory, completedWorkout]);
      alert("Workout completed!");
      setWorkoutInProgress(false);
      setNotes("");

      var obj = {
          setName: "NewWeightTraining",
          newSetName: name,
          exercises: exercises
      };
      var js = JSON.stringify(obj);

      try {
          const response = await fetch('https://largeproject.mattct027.xyz/api/update-set', {
              method: 'POST',
              body: js,
              headers: {
                  'Content-Type': 'application/json'
              }
          });

          var res = JSON.parse(await response.text());

          if (res.error.length <= 0) {
              // Workout/set successfully updated
          } else {
              alert(res.error);
          }
      } catch {
          alert(e.toString);
      }

      setExercises([]);
  };

  const handleAddExercise = async (e) => {
      e.preventDefault();
      if (!currentExercise.trim()) {
          alert("Please enter an exercise name.");
          return;
      }
      setExercises([
          ...exercises,
          {
              name: currentExercise.trim(),
              sets: [],
          },
      ]);

      var obj = {
          name: currentExercise.trim(),
          muscleGroup: currentMuscleGroup.trim(),
          equipmentType: currentEquipmentType.trim()
      };
      var js = JSON.stringify(obj);

      setCurrentExercise("");
      setCurrentMuscleGroup("");
      setCurrentEquipmentType("");

      try {
          const response = await fetch('https://largeproject.mattct027.xyz/api/create-exercise', {
              method: 'POST',
              body: js,
              headers: {
                  'Content-Type': 'application/json'
              }
          });

          var res = JSON.parse(await response.text());

          if (res.error.length <= 0) {
              // Add Exercise is successful
          } else {
              alert(res.error);
          }
      } catch {
          alert(e.toString());
      }
  };

  const handleAddSet = (exerciseIndex) => {
      const updatedExercises = [...exercises];
      updatedExercises[exerciseIndex].sets.push({
          weight: "",
          reps: ""
      });
      setExercises(updatedExercises);
  };

  const handleDeleteSet = (exerciseIndex, setIndex) => {
      const updatedExercises = [...exercises];
      updatedExercises[exerciseIndex].sets.splice(setIndex, 1);
      setExercises(updatedExercises);
  };

  const handleUpdateSet = (exerciseIndex, setIndex, field, value) => {
      const updatedExercises = [...exercises];
      updatedExercises[exerciseIndex].sets[setIndex][field] = value;
      setExercises(updatedExercises);
  };

  const handleEditWorkout = (index) => {
      const workoutToEdit = workoutHistory[index];
      setWorkoutInProgress(true);
      setExercises(workoutToEdit.exercises);
      setNotes(workoutToEdit.notes);
      setIsEditingWorkout(index);
  };

  const handleSaveEditedWorkout = () => {
      const updatedHistory = [...workoutHistory];
      updatedHistory[isEditingWorkout] = {
          exercises,
          notes,
      };
      setWorkoutHistory(updatedHistory);
      setIsEditingWorkout(null);
      setWorkoutInProgress(false);
      alert("Workout updated successfully!");
  };

  const handleStartCardioWorkout = async (e) => {
      e.preventDefault();
      setWorkoutInProgress(true);
      setCardioExercises([]);
      setNotes("");

      var obj = {
          setName: "NewCardio",
          exercises: cardioExercises,
          userId: JSON.parse(localStorage.getItem('user_data')).id
      };
      var js = JSON.stringify(obj);

      try {
          const response = await fetch('https://largeproject.mattct027.xyz/api/create-set', {
              method: 'POST',
              body: js,
              headers: {
                  'Content-Type': 'application/json'
              }
          });

          var res = JSON.parse(await response.text());

          if (res.error.length <= 0) {
              // Workout/set successfully created
          } else {
              alert(res.error);
          }
      } catch {
          alert(e.toString);
      }
  };

  const handleCancelCardioWorkout = async (e) => {
      e.preventDefault();
      if (window.confirm("Are you sure you want to cancel this workout? All progress will be lost.")) {
          setWorkoutInProgress(false);
          setCardioExercises([]);
          setNotes("");

          var obj = {
              setName: "NewCardio"
          };
          var js = JSON.stringify(obj);

          try {
              const response = await fetch('https://largeproject.mattct027.xyz/api/delete-set', {
                  method: 'POST',
                  body: js,
                  headers: {
                      'Content-Type': 'application/json'
                  }
              });

              var res = JSON.parse(await response.text());

              if (res.error.length <= 0) {
                  // Workout/set successfully deleted
                  alert(res.message);
              } else {
                  alert(res.error);
              }
          } catch {
              alert(e.toString);
          }
      }
  };

  const handleFinishCardioWorkout = async (e) => {
      const name = prompt("Please enter a name for your workout:");

      if (!name) {
          alert("Workout name is required.");
          return;
      }

      const completedWorkout = {
        name: name,
        exercises: cardioExercises,
        notes,
      };

      setWorkoutName(name);
      setCardioHistory([...cardioHistory, completedWorkout]);
      alert("Cardio workout completed!");
      setWorkoutInProgress(false);
      setNotes("");

      var obj = {
          setName: "NewCardio",
          newSetName: name,
          exercises: cardioExercises
      };
      var js = JSON.stringify(obj);

      try {
          const response = await fetch('https://largeproject.mattct027.xyz/api/update-set', {
              method: 'POST',
              body: js,
              headers: {
                  'Content-Type': 'application/json'
              }
          });

          var res = JSON.parse(await response.text());

          if (res.error.length <= 0) {
              // Cardio workout/set successfully updated
          } else {
              alert(res.error);
          }
      } catch {
          alert(e.toString);
      }

      setCardioExercises([]);
  };

  const handleAddCardioExercise = async (e) => {
      e.preventDefault();
      if (!currentExercise.trim()) {
          alert("Please enter an exercise name.");
          return;
      }
      setCardioExercises([
          ...cardioExercises,
          {
              name: currentExercise.trim(),
              sets: [],
          },
      ]);

      var obj = {
          name: currentExercise.trim(),
          muscleGroup: currentMuscleGroup.trim(),
          equipmentType: currentEquipmentType.trim()
      };
      var js = JSON.stringify(obj);

      setCurrentExercise("");
      setCurrentMuscleGroup("");
      setCurrentEquipmentType("");

      try {
          const response = await fetch('https://largeproject.mattct027.xyz/api/create-exercise', {
              method: 'POST',
              body: js,
              headers: {
                  'Content-Type': 'application/json'
              }
          });

          var res = JSON.parse(await response.text());

          if (res.error.length <= 0) {
              // Add Cardio Exercise is successful
          } else {
              alert(res.error);
          }
      } catch {
          alert(e.toString());
      }
  };

  const handleAddCardioSet = (exerciseIndex) => {
      const updatedExercises = [...cardioExercises];
      updatedExercises[exerciseIndex].sets.push({
          time: "",
          distance: ""
      });
      setCardioExercises(updatedExercises);
  };

  const handleDeleteCardioSet = (exerciseIndex, setIndex) => {
      const updatedExercises = [...cardioExercises];
      updatedExercises[exerciseIndex].sets.splice(setIndex, 1);
      setCardioExercises(updatedExercises);
  };

  const handleUpdateCardioSet = (exerciseIndex, setIndex, field, value) => {
      const updatedExercises = [...cardioExercises];
      updatedExercises[exerciseIndex].sets[setIndex][field] = value;
      setCardioExercises(updatedExercises);
  };

  const handleEditCardioWorkout = (index) => {
      const workoutToEdit = cardioHistory[index];
      setWorkoutInProgress(true);
      setCardioExercises(workoutToEdit.exercises);
      setNotes(workoutToEdit.notes);
      setIsEditingWorkout(index);
  };

  const handleSaveEditedCardioWorkout = () => {
      const updatedHistory = [...cardioHistory];
      updatedHistory[isEditingWorkout] = {
          exercises: cardioExercises,
          notes,
      };
      setCardioHistory(updatedHistory);
      setIsEditingWorkout(null);
      setWorkoutInProgress(false);
      alert("Cardio workout updated successfully!");
  };

  const handleDeleteWorkout = async (index) => {
    const updatedWorkouts = [...workoutHistory];
    const workoutToDelete = updatedWorkouts[index].setName || updatedWorkouts[index].name;

    var obj = {
      setName: workoutToDelete
    };
    var js = JSON.stringify(obj);

    try {
        const response = await fetch('https://largeproject.mattct027.xyz/api/delete-set', {
            method: 'POST',
            body: js,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        var res = JSON.parse(await response.text());

        if (res.error.length <= 0) {
            // Workout/set successfully deleted
        } else {
            alert(res.error);
        }
    } catch {
        alert("Caught error");
    }

    updatedWorkouts.splice(index, 1);
    setWorkoutHistory(updatedWorkouts);

    localStorage.setItem("workoutHistory", JSON.stringify(updatedWorkouts));
  };

  const handleDeleteCardioWorkout = async (index) => {
    const updatedCardioWorkouts = [...cardioHistory];
    const cardioToDelete = updatedCardioWorkouts[index].setName || updatedCardioWorkouts[index].name;

    var obj = {
      setName: cardioToDelete
    };
    var js = JSON.stringify(obj);

    try {
        const response = await fetch('https://largeproject.mattct027.xyz/api/delete-set', {
            method: 'POST',
            body: js,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        var res = JSON.parse(await response.text());

        if (res.error.length <= 0) {
            // Workout/set successfully deleted
        } else {
            alert(res.error);
        }
    } catch {
        alert("Caught error");
    }

    updatedCardioWorkouts.splice(index, 1);
    setCardioHistory(updatedCardioWorkouts);

    localStorage.setItem("cardioHistory", JSON.stringify(updatedCardioWorkouts));
  };

  if (isSignedOut) {
      return < Home / > ;
  }
      
  return (
    <div>
      <header className="home-header">
        <h1 className="main-title">Fitness Tracker</h1>
        <nav>
          <button className="signout" onClick={signOut}>
            Sign Out
          </button>
          <ul className="nav-links">
            <li>
              <button
                className={`nav-link ${activeTab === "Dashboard" ? "active" : ""}`}
                onClick={() => handleTabClick("Dashboard")}
              >
                Dashboard
              </button>
            </li>
            <li>
              <button
                className={`nav-link ${activeTab === "Weight Training" ? "active" : ""}`}
                onClick={() => {
                  if (workoutHistory !== "") {
                    resetWorkoutHistory()
                    handleRetrieveSets()
                  }
                  handleTabClick("Weight Training")
                }}
              >
                Weight Training
              </button>
            </li>
            <li>
              <button
                className={`nav-link ${activeTab === "Cardio" ? "active" : ""}`}
                onClick={() => handleTabClick("Cardio")}
              >
                Cardio
              </button>
            </li>
          </ul>
        </nav>
      </header>

      <div className="content">
        {activeTab === "Dashboard" && (
          <div className="tab-content active" id="Dashboard">
            <div className="background-box">
              <h1>Dashboard</h1>
              <div className="dashboard-boxes">
                <div className="top-box">
                  <h2>Check-In Calendar</h2>
                  <div className="calendar-wrapper">
                    <Calendar
                      onClickDay={handleDateClick}
                      value={selectedDate}
                      tileClassName={({ date }) =>
                        workoutDates.includes(date.toDateString()) ? "workout-day" : null
                      }
                    />
                  </div>
                  <p>
                    {workoutDates.includes(selectedDate.toDateString())
                      ? "You worked out on this day!"
                      : "You did not check in for this day."}
                  </p>
                </div>
                <div className="middle-box">
                  <h2>Progress</h2>
                  <p>You have worked out for {workoutDates.length} day(s) this month.</p>
                </div>
                <div className="bottom-box">
                  <h2>Goals</h2>
                  <p>
                    <strong>Starting Weight:</strong> {startingWeight} kg
                  </p>
                  <p>
                    <strong>Current Weight:</strong> {currentUserWeight} kg
                  </p>
                  <div>
                  <input
                      className="goals-input"
                      type="number"
                      placeholder="Update your weight e.g., 6"
                      value={newWeightInput}
                      onChange={(e) => setNewWeightInput(e.target.value)}
                  />
                  </div>
                  <div className="goals-buttons">
                    <button className="log-button" onClick={handleCurrentWeightUpdate}>Log Current Weight</button>
                    <button  className="log-button" onClick={handleStartingWeightUpdate}>Update Starting Weight</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Weight Training" && (
          <div className="tab-content active weight-training">
            <div className="background-box">
              <h1 className="section-title">Weight Training</h1>
              {!workoutInProgress ? (
                <button
                  className="modern-button start-workout-button"
                  onClick={handleStartWorkout}
                >
                  Start Workout
                </button>
              ) : (
                <>
                  <div className="workout-details">
                    <input
                      type="text"
                      placeholder="Exercise Name (e.g., Deadlift)"
                      value={currentExercise}
                      onChange={(e) => setCurrentExercise(e.target.value)}
                      className="modern-input"
                    />
                    <input
                      type="text"
                      placeholder="Muscle Group (e.g., Core)"
                      value={currentMuscleGroup}
                      onChange={(e) => setCurrentMuscleGroup(e.target.value)}
                      className="modern-input"
                    />
                    <input
                      type="text"
                      placeholder="Equipment Type (e.g., Barbells)"
                      value={currentEquipmentType}
                      onChange={(e) => setCurrentEquipmentType(e.target.value)}
                      className="modern-input"
                    />
                    <button
                      className="add-exercise-button modern-button"
                      onClick={handleAddExercise}
                    >
                      Add Exercise
                    </button>
                  </div>
                  {exercises.map((exercise, index) => (
                    <div key={index}>
                      <h3>{exercise.name}</h3>
                      {exercise.sets.map((set, setIndex) => (
                        <div key={setIndex} className="exercise-item">
                          <input
                            type="number"
                            placeholder="Weight (kg)"
                            value={set.weight}
                            onChange={(e) =>
                              handleUpdateSet(index, setIndex, "weight", e.target.value)
                            }
                            className="modern-input"
                          />
                          <input
                            type="number"
                            placeholder="Reps"
                            value={set.reps}
                            onChange={(e) =>
                              handleUpdateSet(index, setIndex, "reps", e.target.value)
                            }
                            className="modern-input"
                          />
                          <button
                            className="delete-set-button modern-button"
                            onClick={() => handleDeleteSet(index, setIndex)}
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                      <button
                        className="add-exercise-button modern-button"
                        onClick={() => handleAddSet(index)}
                      >
                        Add Set
                      </button>
                    </div>
                  ))}
                  <textarea
                    placeholder="Notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="modern-input"
                  ></textarea>
                  <div className="workout-buttons">
                    {isEditingWorkout !== null ? (
                      <button
                        className="log-button save-button"
                        onClick={handleSaveEditedWorkout}
                      >
                        Save Changes
                      </button>
                    ) : (
                      <button
                        className="log-button finish-button"
                        onClick={handleFinishWorkout}
                      >
                        Finish Workout
                      </button>
                    )}
                    <button
                      className="log-button cancel-button"
                      onClick={handleCancelWorkout}
                    >
                      Cancel Workout
                    </button>
                  </div>
                </>
              )}
              <div className="workout-history">
                {workoutHistory.map((workout, index) => (
                  <div key={index} className="workout-history-item">
                    {workout.exercises.map((exercise, exerciseIndex) => (
                      <div key={exerciseIndex}>
                        <strong>{exercise.name}</strong>
                        {exercise.sets.map((set, setIndex) => (
                          <p key={setIndex}>
                            {set.weight} kg x {set.reps} reps
                          </p>
                        ))}
                      </div>
                    ))}
                    <p>Notes: {workout.notes}</p>
                    <button
                      className="log-button edit-button"
                      onClick={() => handleEditWorkout(index)}
                    >
                      Edit Workout
                    </button>
                    <button
                      className="log-button delete-button"
                      onClick={() => handleDeleteWorkout(index)}
                    >
                      Delete Workout
                  </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "Cardio" && (
          <div className="tab-content active cardio">
            <div className="background-box">
              <h1 className="section-title">Cardio</h1>
              {!workoutInProgress ? (
                <button
                  className="modern-button start-workout-button"
                  onClick={handleStartCardioWorkout}
                >
                  Start Workout
                </button>
              ) : (
                <>
                  <div className="workout-details">
                    <input
                      type="text"
                      placeholder="Exercise Name (e.g., Run, Bike Ride)"
                      value={currentExercise}
                      onChange={(e) => setCurrentExercise(e.target.value)}
                      className="modern-input"
                    />
                    <input
                      type="text"
                      placeholder="Muscle Group (e.g., Legs)"
                      value={currentMuscleGroup}
                      onChange={(e) => setCurrentMuscleGroup(e.target.value)}
                      className="modern-input"
                    />
                    <input
                      type="text"
                      placeholder="Equipment Type (e.g., Body, Bike)"
                      value={currentEquipmentType}
                      onChange={(e) => setCurrentEquipmentType(e.target.value)}
                      className="modern-input"
                    />
                    <button
                      className="add-exercise-button modern-button"
                      onClick={handleAddCardioExercise}
                    >
                      Add Exercise
                    </button>
                  </div>
                  {cardioExercises.map((exercise, index) => (
                    <div key={index} className="exercise-item">
                      <h3>{exercise.name}</h3>
                      {exercise.sets.map((set, setIndex) => (
                        <div key={setIndex} className="set-inputs">
                          <input
                            type="number"
                            placeholder="Time (min)"
                            value={set.time}
                            onChange={(e) =>
                              handleUpdateCardioSet(index, setIndex, "time", e.target.value)
                            }
                            className="modern-input"
                          />
                          <input
                            type="number"
                            placeholder="Distance (km)"
                            value={set.distance}
                            onChange={(e) =>
                              handleUpdateCardioSet(index, setIndex, "distance", e.target.value)
                            }
                            className="modern-input"
                          />
                          <button
                            className="modern-button delete-set-button"
                            onClick={() => handleDeleteCardioSet(index, setIndex)}
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                      <button
                        className="add-exercise-button modern-button"
                        onClick={() => handleAddCardioSet(index)}
                      >
                        Add Cardio Set
                      </button>
                    </div>
                  ))}
                  <textarea
                    placeholder="Notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="modern-input notes-input"
                  ></textarea>
                  <div className="workout-actions">
                    <button
                      className="log-button save-button"
                      onClick={() =>
                        isEditingWorkout !== null
                          ? handleSaveEditedCardioWorkout()
                          : handleFinishCardioWorkout()
                      }
                    >
                      {isEditingWorkout !== null ? "Save Changes" : "Finish Workout"}
                    </button>
                    <button
                      className="log-button cancel-button"
                      onClick={handleCancelCardioWorkout}
                    >
                      Cancel Workout
                    </button>
                  </div>
                </>
              )}
              {cardioHistory.map((workout, index) => (
                <div key={index} className="workout-history-item">
                  {workout.exercises.map((exercise, exerciseIndex) => (
                    <div key={exerciseIndex} className="exercise-history">
                      <strong>{exercise.name}</strong>
                      {exercise.sets.map((set, setIndex) => (
                        <p key={setIndex}>
                          {set.time} min, {set.distance} km
                        </p>
                      ))}
                    </div>
                  ))}
                  <p>
                    <strong>Notes:</strong> {workout.notes}
                  </p>
                  <button
                    className="log-button edit-button"
                    onClick={() => handleEditCardioWorkout(index)}
                  >
                    Edit Workout
                  </button>
                  <button
                    className="log-button delete-button"
                    onClick={() => handleDeleteCardioWorkout(index)}
                  >
                    Delete Workout
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default HomePage;
