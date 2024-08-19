import { useState } from 'react'
import TextInput from './components/droopyInput'
import PhysicsPlayground from './components/physicsPlayground'
import JiggleDroop from './components/JiggleDrooop';

import './app.css';
import AppendDrooop from './components/AppendDrooop';
import CreateWorld from './components/CreateWorld';




function App() {
  const text = "HELLO WORLDss12341234s"; 
  const [inputValue, setInputValue] = useState(''); 
  const handleInputChange = (event) => {
    setInputValue(event.target.value); 
  };

  return (
    <>
    <div>
    {/* <input
          type="text"
          value={inputValue} // Bind the input value to the state
          onChange={handleInputChange} // Update the state on input change
          placeholder="Type something..." // Optional: Add a placeholder
        /> */}
      {/* <JiggleDroop text= {inputValue} /> */}
      {/* <PhysicsPlayground /> */}
      <CreateWorld />

    </div>
    </>
  )
}

export default App
