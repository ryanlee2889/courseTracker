import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import { getSectionData } from './soc.js';
import { db , getSnipes} from './firebase.js';
import { collection, setDoc, getDocs, deleteDoc, updateDoc, doc, query, where } from "firebase/firestore"; 
import Notification from './notify.js';


function App() {
  const [inputSection, setSectionValue] = useState('');
  const [snipes, setSnipes] = useState([]);
  const [userEmail, setUserEmail] = useState('');
  const [semester, setSemester] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationDuration, setNotificationDuration] = useState(0);
  const emailInputRef = useRef();
  
  const snipesRef = useRef(snipes);

  useEffect(() => {
    snipesRef.current = snipes
  }, [snipes]);

  useEffect(() => {
    const fetchSnipes = async () => {
      const snipesData = await getSnipes();
      setSnipes(snipesData);
    };

    fetchSnipes();
  }, []);
  

  useEffect(() => {
    const intervalId = setInterval(async () => {
      const newSnipes = await Promise.all(snipesRef.current.map(async snipe => {
        if (!snipe.index) return snipe;
        const term = snipe.semester === 'fall' ? '9' : '1';
        const year = snipe.semester === 'fall' ? '2023' : '2024';
        const url = `http://localhost:3001/soc/api/courses.json?year=${year}&term=${term}&campus=NB`;
      
        const [status] = await getSectionData(snipe.index, url);
        const statusText = status ? "Open" : "Closed";
      
        if (statusText !== snipe.status) {
          const updatedDoc = doc(db, "snipes", snipe.index);
          await updateDoc(updatedDoc, { status: statusText });
      
          // If the status has changed to "Open", send an email
          if(statusText === "Open"){
            await fetch('http://localhost:3001/send-email', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ email: userEmail, courseName: snipe.courseName })
            });
            console.log("Email sent");
          }
      
          // Update the Snipe object
          snipe = { ...snipe, status: statusText };
        }
      
        // Return the snipe (whether it was updated or not)
        return snipe;
      }));
      
      // Update the snipes state
      setSnipes(newSnipes);
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const clearSnipes = async () => {
    setSnipes([]);
  
    // Get all the snipes from Firestore
    const querySnapshot = await getDocs(collection(db, "snipes"));
  
    // Delete each snipe
    querySnapshot.forEach((docSnapshot) => {
      deleteDoc(doc(db, "snipes", docSnapshot.id));
    });
  };

  const addSnipe = async () => {
    const term = semester === 'fall' ? '9' : '1';
    const year = semester === 'fall' ? '2023' : '2024';
    const url = `http://localhost:3001/soc/api/courses.json?year=${year}&term=${term}&campus=NB`;
    
    if (!semester) {
      setNotificationMessage(`Please select a semester. Timestamp: ${Date.now()}`);
      setNotificationDuration(5);
      return;
    }

    const data = await getSectionData(inputSection, url);
    if (data === undefined) {
      setNotificationMessage(`Error adding course. Timestamp: ${Date.now()}`);
      setNotificationDuration(5);
    } else {
      const [status, name] = data;
      if (status) {
        setNotificationMessage(`This class is already open. Timestamp: ${Date.now()}`);
        setNotificationDuration(5);
        return;
      }
      const statusText = status ? "Open" : "Closed";
      const newSnipe = { courseName: name, index: inputSection, status: statusText, semester };
  
      // Query Firestore for a snipe with the same index
    const snipesCollection = collection(db, "snipes");
    const q = query(snipesCollection, where("index", "==", newSnipe.index));
    const querySnapshot = await getDocs(q);

    // If a snipe with the same index exists, show a notification and return without adding the new snipe
    if (!querySnapshot.empty) {
      setNotificationMessage(`A snipe with index ${newSnipe.index} already exists. Timestamp: ${Date.now()}`);
      setNotificationDuration(5);
      return;
    }

    // Add the new snipe to Firestore
    const snipeDoc = doc(db, "snipes", newSnipe.index);
    await setDoc(snipeDoc, newSnipe);

    // Add the new snipe to the snipes state
    setSnipes(prevSnipes => [...prevSnipes, newSnipe]);
      }
    };

  const deleteSnipe = async (snipeIndex) => {
    // Query Firestore for the snipe with the specific index
    const snipesCollection = collection(db, "snipes");
    const q = query(snipesCollection, where("index", "==", snipeIndex));
    const querySnapshot = await getDocs(q);
  
    // If a snipe with the specific index exists, delete it
    if (!querySnapshot.empty) {
      const snipeDocSnapshot = querySnapshot.docs[0];
      await deleteDoc(doc(db, "snipes", snipeDocSnapshot.id));
    }
  
    // Remove the snipe from the snipes state
    setSnipes(snipes => snipes.filter(snipe => snipe.index !== snipeIndex));
  }

  return (
    <div className="App">
      <Notification message={notificationMessage} duration={notificationDuration} />
      <h1>Course Sniper</h1>
      <div className="Wrapper">
        <div className="AddSnipe"> 
          <h3 className="snipeText">Add A Snipe</h3>
          <div className="snipeContainer">
            <div className="snipeInput">
              <input 
                className="sectionInput" 
                type="text" 
                value={inputSection} 
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || /^[0-9\b]+$/.test(val)) {
                    setSectionValue(val);
                  }
                }} 
                placeholder="Course Number"
                maxLength="5"
              />
              <button className="snipeButton" onClick={addSnipe}>Add Course</button>
            </div>
            <select value={semester} onChange={event => setSemester(event.target.value)}>
              <option value="" disabled selected hidden>Semester</option>
              <option value="fall">Fall</option>
              <option value="spring">Spring</option>
            </select>
            <button className="clearSnipeButton" onClick={clearSnipes}>Clear Snipes</button>
          </div>  
        </div>
          
        <div className = "UserInfo">
          <h3>User Information</h3>
          <div className="emailContainer">
            <input type="text" placeholder="Email Address" ref={emailInputRef} />
              <button className="UpdateEmail" onClick={() => {
                setUserEmail(emailInputRef.current.value);
                setNotificationMessage(`Email updated to: ${emailInputRef.current.value}. Timestamp: ${Date.now()}`);
                setNotificationDuration(5);
              }}>Update Email</button>
          </div>
        </div>

      </div>
      
      <div className="SnipeList">
        <div className="Snipe">
          <p className="filler"></p>
          <p>Course Name</p>
          <p>Index</p>
          <p>Status</p>
        </div>
        {snipes.map((snipe, index) => (
          <div key={index} className="SnipeItem">
            <button className="deleteSnipe" onClick={() => deleteSnipe(snipe.index)}>X</button>
            <div><p>{snipe.courseName}</p></div>
            <div><p>{snipe.index}</p></div>
            <div><p>{snipe.status}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;