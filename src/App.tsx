import { useState } from 'react';
import './App.css'
import StliteWrapper from './StliteWrapper'

const defaultPythonScript = `
import streamlit as st
import pandas as pd
import numpy as np
import duckdb

if st.session_state.get("df") is None:
  df = pd.DataFrame({
      'first': list(range(1, 11)),
      'second': np.random.randn(10)
  })
  st.session_state["df"] = df

df = st.session_state.df
query = st.text_input(label="query", value="SELECT * FROM df where first > 1")
st.dataframe(duckdb.sql(query).df())
`.trim();

const defaultRequirements = [
  'pandas',
  'numpy',
  'duckdb'
];

function App() {
  const [pythonScript, setPythonScript] = useState(defaultPythonScript)
  const [requirements, setRequirements] = useState(defaultRequirements)
  return (
    <div className="app-container">
      <div className="editor">
        <input type="text" value={requirements.join(" ")} onChange={(e) => {
          setRequirements(e.target.value.split(" ").map(s => s.trim()));
        }} />
        <textarea value={pythonScript} onChange={(e) => {
          setPythonScript(e.target.value);
        }}></textarea>
      </div>
      <div className="viewer">
        <StliteWrapper pythonScript={pythonScript} requirements={requirements.filter(s => s.length)} hideHeader={true} />
      </div>
    </div>
  )
}

export default App
