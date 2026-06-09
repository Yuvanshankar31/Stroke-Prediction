import React, { useState, useEffect } from "react";
import {
  Activity,
  Heart,
  User,
  Clock,
  Info,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Award,
  ChevronRight,
  RotateCcw
} from "lucide-react";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState({
    gender: "",
    age: "",
    hypertension: "",
    heart_disease: "",
    ever_married: "",
    work_type: "",
    Residence_type: "",
    avg_glucose_level: "",
    bmi: "",
    smoking_status: "",
  });

  const [predictionResult, setPredictionResult] = useState(null);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("stroke_prediction_history");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const setManualValue = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const resetForm = () => {
    setFormData({
      gender: "",
      age: "",
      hypertension: "",
      heart_disease: "",
      ever_married: "",
      work_type: "",
      Residence_type: "",
      avg_glucose_level: "",
      bmi: "",
      smoking_status: "",
    });
    setFormStep(1);
    setPredictionResult(null);
    setAlert({ type: "", message: "" });
  };

  const handleNextStep = () => {
    if (formStep === 1) {
      if (!formData.gender || !formData.age || !formData.ever_married) {
        setAlert({ type: "error", message: "Please fill in all fields in this step." });
        return;
      }
    } else if (formStep === 2) {
      if (!formData.avg_glucose_level || !formData.bmi) {
        setAlert({ type: "error", message: "Please fill in all fields in this step." });
        return;
      }
    }
    setAlert({ type: "", message: "" });
    setFormStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setAlert({ type: "", message: "" });
    setFormStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: "", message: "" });

    // Final validation
    if (
      !formData.gender ||
      !formData.age ||
      !formData.hypertension ||
      !formData.heart_disease ||
      !formData.ever_married ||
      !formData.work_type ||
      !formData.Residence_type ||
      !formData.avg_glucose_level ||
      !formData.bmi ||
      !formData.smoking_status
    ) {
      setAlert({ type: "error", message: "Please complete all steps before predicting." });
      return;
    }

    setIsLoading(true);

    const dataToSend = {
      ...formData,
      age: Number(formData.age),
      avg_glucose_level: Number(formData.avg_glucose_level),
      bmi: Number(formData.bmi),
      hypertension: Number(formData.hypertension),
      heart_disease: Number(formData.heart_disease),
    };

    try {
      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });
      const result = await response.json();

      if (response.ok) {
        setPredictionResult(result.stroke);
        const newRecord = {
          id: Date.now(),
          timestamp: new Date().toLocaleString(),
          input: { ...dataToSend },
          result: result.stroke,
        };
        const updatedHistory = [newRecord, ...history];
        setHistory(updatedHistory);
        localStorage.setItem("stroke_prediction_history", JSON.stringify(updatedHistory));
        setAlert({ type: "success", message: `Analysis complete. Scroll down to see results.` });
      } else {
        setAlert({ type: "error", message: `Error: ${result.error}` });
      }
    } catch (error) {
      setAlert({ type: "error", message: "Error: Connection to prediction service failed." });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteHistoryRecord = (id) => {
    const updatedHistory = history.filter((record) => record.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem("stroke_prediction_history", JSON.stringify(updatedHistory));
  };

  const clearAllHistory = () => {
    setHistory([]);
    localStorage.removeItem("stroke_prediction_history");
  };

  // Real-time classification calculations
  const getBMICategory = (bmiVal) => {
    const val = Number(bmiVal);
    if (!val) return null;
    if (val < 18.5) return { label: "Underweight", color: "#e2a400" };
    if (val < 25) return { label: "Healthy Weight", color: "#00e676" };
    if (val < 30) return { label: "Overweight", color: "#ff9100" };
    return { label: "Obese Range", color: "#ff1744" };
  };

  const getGlucoseCategory = (glcVal) => {
    const val = Number(glcVal);
    if (!val) return null;
    if (val < 100) return { label: "Normal Glucose", color: "#00e676" };
    if (val < 126) return { label: "Prediabetes Alert", color: "#ff9100" };
    return { label: "Diabetes Alert", color: "#ff1744" };
  };

  const bmiCat = getBMICategory(formData.bmi);
  const glucoseCat = getGlucoseCategory(formData.avg_glucose_level);

  return (
    <div className="app-layout">
      {/* Background Animated Elements */}
      <div className="bg-glow circle-1"></div>
      <div className="bg-glow circle-2"></div>
      <div className="bg-glow circle-3"></div>

      <header className="navbar">
        <div className="brand">
          <Activity className="brand-logo pulse" />
          <span className="brand-name">NeuroShield</span>
          <span className="brand-tag">Stroke Risk Engine</span>
        </div>
        <nav className="nav-tabs">
          <button
            className={`tab-btn ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <Activity size={18} />
            <span>Dashboard</span>
          </button>
          <button
            className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            <Clock size={18} />
            <span>History ({history.length})</span>
          </button>
          <button
            className={`tab-btn ${activeTab === "info" ? "active" : ""}`}
            onClick={() => setActiveTab("info")}
          >
            <Info size={18} />
            <span>Education</span>
          </button>
        </nav>
      </header>

      <main className="main-content">
        {activeTab === "dashboard" && (
          <div className="dashboard-grid">
            {/* Left Column: Multi-Step Input Panel */}
            <div className="glass-card form-panel">
              <div className="panel-header">
                <h2>Health Assessment</h2>
                <p>Provide client vitals and demographics to compute stroke likelihood.</p>
              </div>

              {/* Progress Steps Indicator */}
              <div className="step-indicator">
                <div className={`step-node ${formStep >= 1 ? "active" : ""} ${formStep > 1 ? "completed" : ""}`}>
                  <span>1</span>
                  <label>Profile</label>
                </div>
                <div className="step-line-container">
                  <div className={`step-line ${formStep >= 2 ? "active" : ""}`}></div>
                </div>
                <div className={`step-node ${formStep >= 2 ? "active" : ""} ${formStep > 2 ? "completed" : ""}`}>
                  <span>2</span>
                  <label>Vitals</label>
                </div>
                <div className="step-line-container">
                  <div className={`step-line ${formStep >= 3 ? "active" : ""}`}></div>
                </div>
                <div className={`step-node ${formStep >= 3 ? "active" : ""} ${predictionResult !== null ? "completed" : ""}`}>
                  <span>3</span>
                  <label>Medical</label>
                </div>
              </div>

              {alert.message && (
                <div className={`notification-alert alert-${alert.type}`}>
                  {alert.type === "error" ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                  <span>{alert.message}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="wizard-form">
                {/* STEP 1: Demographic Profile */}
                {formStep === 1 && (
                  <div className="form-step-container fade-in">
                    <h3 className="step-title">Step 1: General Information</h3>
                    
                    {/* Gender Card Selector */}
                    <div className="form-group-custom">
                      <label className="group-label">Gender Selection</label>
                      <div className="card-selector">
                        {["Male", "Female", "Other"].map((g) => (
                          <button
                            type="button"
                            key={g}
                            className={`select-card ${formData.gender === g ? "selected" : ""}`}
                            onClick={() => setManualValue("gender", g)}
                          >
                            <User size={20} />
                            <span>{g}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Age Input with Info */}
                    <div className="form-group-custom">
                      <label className="group-label" htmlFor="age-input">Age (years)</label>
                      <div className="input-with-icon">
                        <input
                          id="age-input"
                          type="number"
                          name="age"
                          min="0"
                          max="125"
                          placeholder="e.g. 45"
                          value={formData.age}
                          onChange={handleChange}
                          required
                        />
                        <span className="input-suffix">yrs</span>
                      </div>
                      {formData.age && Number(formData.age) > 65 && (
                        <p className="input-helper-text warning">
                          <AlertTriangle size={12} /> Age above 65 carries naturally higher baseline vascular risk.
                        </p>
                      )}
                    </div>

                    {/* Ever Married Card Selector */}
                    <div className="form-group-custom">
                      <label className="group-label">Ever Married?</label>
                      <div className="card-selector toggle">
                        {["Yes", "No"].map((m) => (
                          <button
                            type="button"
                            key={m}
                            className={`select-card ${formData.ever_married === m ? "selected" : ""}`}
                            onClick={() => setManualValue("ever_married", m)}
                          >
                            <span>{m}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="step-controls">
                      <div></div>
                      <button type="button" className="btn-primary" onClick={handleNextStep}>
                        <span>Continue</span>
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: Vitals */}
                {formStep === 2 && (
                  <div className="form-step-container fade-in">
                    <h3 className="step-title">Step 2: Key Vitals</h3>

                    {/* Avg Glucose Level */}
                    <div className="form-group-custom">
                      <label className="group-label" htmlFor="glucose-input">Average Glucose Level (mg/dL)</label>
                      <div className="input-with-icon">
                        <input
                          id="glucose-input"
                          type="number"
                          step="0.01"
                          name="avg_glucose_level"
                          placeholder="e.g. 98.2"
                          value={formData.avg_glucose_level}
                          onChange={handleChange}
                          required
                        />
                        <span className="input-suffix">mg/dL</span>
                      </div>
                      {glucoseCat && (
                        <p className="input-helper-text" style={{ color: glucoseCat.color }}>
                          <Activity size={12} /> {glucoseCat.label}
                        </p>
                      )}
                    </div>

                    {/* BMI Input */}
                    <div className="form-group-custom">
                      <label className="group-label" htmlFor="bmi-input">Body Mass Index (BMI)</label>
                      <div className="input-with-icon">
                        <input
                          id="bmi-input"
                          type="number"
                          step="0.1"
                          name="bmi"
                          placeholder="e.g. 24.5"
                          value={formData.bmi}
                          onChange={handleChange}
                          required
                        />
                        <span className="input-suffix">kg/m²</span>
                      </div>
                      {bmiCat && (
                        <p className="input-helper-text" style={{ color: bmiCat.color }}>
                          <Heart size={12} /> {bmiCat.label}
                        </p>
                      )}
                    </div>

                    <div className="step-controls">
                      <button type="button" className="btn-secondary" onClick={handlePrevStep}>
                        <ArrowLeft size={18} />
                        <span>Back</span>
                      </button>
                      <button type="button" className="btn-primary" onClick={handleNextStep}>
                        <span>Continue</span>
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Medical Conditions & Lifestyle */}
                {formStep === 3 && (
                  <div className="form-step-container fade-in">
                    <h3 className="step-title">Step 3: Medical Profile & Lifestyle</h3>

                    {/* Hypertension Grid */}
                    <div className="form-grid-2col">
                      <div className="form-group-custom">
                        <label className="group-label">Hypertension?</label>
                        <div className="card-selector toggle">
                          <button
                            type="button"
                            className={`select-card mini ${formData.hypertension === "1" ? "selected warning-glow" : ""}`}
                            onClick={() => setManualValue("hypertension", "1")}
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            className={`select-card mini ${formData.hypertension === "0" ? "selected" : ""}`}
                            onClick={() => setManualValue("hypertension", "0")}
                          >
                            No
                          </button>
                        </div>
                      </div>

                      {/* Heart Disease Grid */}
                      <div className="form-group-custom">
                        <label className="group-label">Heart Disease?</label>
                        <div className="card-selector toggle">
                          <button
                            type="button"
                            className={`select-card mini ${formData.heart_disease === "1" ? "selected warning-glow" : ""}`}
                            onClick={() => setManualValue("heart_disease", "1")}
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            className={`select-card mini ${formData.heart_disease === "0" ? "selected" : ""}`}
                            onClick={() => setManualValue("heart_disease", "0")}
                          >
                            No
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Work Type Styled Select */}
                    <div className="form-group-custom">
                      <label className="group-label" htmlFor="work-select">Employment Status</label>
                      <select
                        id="work-select"
                        name="work_type"
                        value={formData.work_type}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select employment status</option>
                        <option value="Private">Private Company</option>
                        <option value="Self-employed">Self-employed</option>
                        <option value="Govt_job">Government Employee</option>
                        <option value="Children">Underage/Children</option>
                        <option value="Never_worked">Never Worked</option>
                      </select>
                    </div>

                    {/* Residence Type Card */}
                    <div className="form-group-custom">
                      <label className="group-label">Residence Type</label>
                      <div className="card-selector toggle">
                        {["Urban", "Rural"].map((r) => (
                          <button
                            type="button"
                            key={r}
                            className={`select-card ${formData.Residence_type === r ? "selected" : ""}`}
                            onClick={() => setManualValue("Residence_type", r)}
                          >
                            <span>{r}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Smoking Status Dropdown */}
                    <div className="form-group-custom">
                      <label className="group-label" htmlFor="smoking-select">Smoking History</label>
                      <select
                        id="smoking-select"
                        name="smoking_status"
                        value={formData.smoking_status}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select smoking history</option>
                        <option value="never smoked">Never Smoked</option>
                        <option value="formerly smoked">Formerly Smoked</option>
                        <option value="smokes">Actively Smokes</option>
                      </select>
                    </div>

                    <div className="step-controls">
                      <button type="button" className="btn-secondary" onClick={handlePrevStep}>
                        <ArrowLeft size={18} />
                        <span>Back</span>
                      </button>
                      <button type="submit" className="btn-submit" disabled={isLoading}>
                        {isLoading ? (
                          <div className="spinner"></div>
                        ) : (
                          <>
                            <Sparkles size={18} />
                            <span>Evaluate Stroke Risk</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>

              {predictionResult !== null && (
                <div className="reset-bar">
                  <button onClick={resetForm} className="btn-reset">
                    <RotateCcw size={16} />
                    <span>Reset Assessment Form</span>
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Visual Result Panel */}
            <div className="glass-card result-panel">
              {predictionResult === null ? (
                <div className="result-placeholder">
                  <Activity className="placeholder-icon pulse" />
                  <h3>Risk Assessment Report</h3>
                  <p>
                    Please fill out the medical vitals and demographic data on the left panel to begin diagnostic risk evaluation.
                  </p>
                  <div className="metric-tips">
                    <div className="tip-card">
                      <Heart className="tip-icon" />
                      <span>Evaluates BMI Health Standards</span>
                    </div>
                    <div className="tip-card">
                      <Award className="tip-icon" />
                      <span>Checks Cardiovascular Indicators</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="result-display fade-in">
                  <h3 className="result-panel-title">Diagnostic Verdict</h3>
                  
                  {/* Gauge Risk Meter */}
                  <div className="gauge-outer">
                    <div className={`gauge-container ${predictionResult === 1 ? "high" : "low"}`}>
                      <div className="gauge-fill"></div>
                      <div className="gauge-content">
                        <span className="risk-level">{predictionResult === 1 ? "HIGH" : "LOW"}</span>
                        <span className="risk-label">Stroke Risk</span>
                      </div>
                    </div>
                  </div>

                  <div className={`result-card-verdict ${predictionResult === 1 ? "danger" : "safe"}`}>
                    {predictionResult === 1 ? (
                      <>
                        <AlertTriangle size={24} className="verdict-icon animation-shake" />
                        <div>
                          <h4>Clinical Action Recommended</h4>
                          <p>
                            Vascular assessment model reports a high correlation with stroke factors. Professional clinical screening is strongly advised.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={24} className="verdict-icon" />
                        <div>
                          <h4>Risk Profile normal</h4>
                          <p>
                            Factors analyzed fall within the normal baseline threshold. Keep maintaining healthy habits to protect your long-term cardiovascular health.
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Diagnostic Breakdown */}
                  <div className="diagnosis-breakdown">
                    <h4>Clinical Risk Breakdown</h4>
                    
                    <div className="breakdown-list">
                      <div className="breakdown-item">
                        <span>Classification</span>
                        <span className="val-badge">{formData.age} years old</span>
                      </div>
                      
                      <div className="breakdown-item">
                        <span>Hypertension Factor</span>
                        <span className={`val-badge ${formData.hypertension === "1" ? "bad" : "good"}`}>
                          {formData.hypertension === "1" ? "Detected" : "None"}
                        </span>
                      </div>

                      <div className="breakdown-item">
                        <span>Heart Disease</span>
                        <span className={`val-badge ${formData.heart_disease === "1" ? "bad" : "good"}`}>
                          {formData.heart_disease === "1" ? "Detected" : "None"}
                        </span>
                      </div>

                      {bmiCat && (
                        <div className="breakdown-item">
                          <span>BMI Level ({formData.bmi})</span>
                          <span className="val-badge" style={{ color: bmiCat.color, background: `${bmiCat.color}15` }}>
                            {bmiCat.label}
                          </span>
                        </div>
                      )}

                      {glucoseCat && (
                        <div className="breakdown-item">
                          <span>Blood Glucose ({formData.avg_glucose_level})</span>
                          <span className="val-badge" style={{ color: glucoseCat.color, background: `${glucoseCat.color}15` }}>
                            {glucoseCat.label}
                          </span>
                        </div>
                      )}

                      <div className="breakdown-item">
                        <span>Smoking History</span>
                        <span className="val-badge">{formData.smoking_status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="health-tips-section">
                    <h4>Preventive Clinical Guidelines</h4>
                    <ul>
                      {predictionResult === 1 && (
                        <>
                          <li>Schedule a consultation with a cardiologist to run comprehensive tests.</li>
                          <li>Monitor blood pressure daily; record readings and consult if consistently high.</li>
                        </>
                      )}
                      {Number(formData.bmi) >= 25 && (
                        <li>Incorporate 150 minutes of moderate cardiovascular exercises weekly to support ideal BMI.</li>
                      )}
                      {Number(formData.avg_glucose_level) >= 100 && (
                        <li>Limit intake of simple sugars and processed carbohydrates; check fasting glucose levels.</li>
                      )}
                      {formData.smoking_status === "smokes" && (
                        <li>Establish a smoking cessation plan. Nicotine severely constricts arterial pathways.</li>
                      )}
                      <li>Ensure a diet rich in potassium, fiber, and omega-3 fatty acids.</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="glass-card history-container fade-in">
            <div className="history-header">
              <div>
                <h2>Calculated History Log</h2>
                <p>Verify historical clinical assessments stored on this device.</p>
              </div>
              {history.length > 0 && (
                <button onClick={clearAllHistory} className="btn-clear-history">
                  <Trash2 size={16} />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="empty-history">
                <Clock size={48} className="placeholder-icon" />
                <h3>No Assessments Found</h3>
                <p>Run a new vascular risk assessment from the Dashboard tab to create logs.</p>
                <button onClick={() => setActiveTab("dashboard")} className="btn-primary">
                  <span>Go to Dashboard</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            ) : (
              <div className="history-list">
                {history.map((record) => {
                  const recordBmiCat = getBMICategory(record.input.bmi);
                  const recordGlcCat = getGlucoseCategory(record.input.avg_glucose_level);
                  
                  return (
                    <div key={record.id} className="history-card">
                      <div className="history-card-top">
                        <div className="timestamp-wrapper">
                          <Clock size={14} />
                          <span>{record.timestamp}</span>
                        </div>
                        <span className={`risk-tag ${record.result === 1 ? "high" : "low"}`}>
                          {record.result === 1 ? "HIGH RISK" : "LOW RISK"}
                        </span>
                      </div>
                      
                      <div className="history-card-body">
                        <div className="metric-badge">
                          <strong>Age:</strong> {record.input.age}
                        </div>
                        <div className="metric-badge">
                          <strong>Gender:</strong> {record.input.gender}
                        </div>
                        <div className="metric-badge">
                          <strong>BMI:</strong> {record.input.bmi}{" "}
                          {recordBmiCat && (
                            <span style={{ color: recordBmiCat.color }}>({recordBmiCat.label})</span>
                          )}
                        </div>
                        <div className="metric-badge">
                          <strong>Glucose:</strong> {record.input.avg_glucose_level}{" "}
                          {recordGlcCat && (
                            <span style={{ color: recordGlcCat.color }}>({recordGlcCat.label})</span>
                          )}
                        </div>
                        <div className="metric-badge">
                          <strong>Hypertension:</strong> {record.input.hypertension === 1 ? "Yes" : "No"}
                        </div>
                        <div className="metric-badge">
                          <strong>Heart Disease:</strong> {record.input.heart_disease === 1 ? "Yes" : "No"}
                        </div>
                        <div className="metric-badge">
                          <strong>Smoking:</strong> {record.input.smoking_status}
                        </div>
                      </div>

                      <button
                        onClick={() => deleteHistoryRecord(record.id)}
                        className="btn-delete-item"
                        title="Delete record"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "info" && (
          <div className="info-grid fade-in">
            {/* FAST Card */}
            <div className="glass-card info-card primary-accent">
              <div className="info-icon-wrapper">
                <AlertTriangle size={32} />
              </div>
              <h3>Recognize Stroke FAST</h3>
              <p>Strokes are medical emergencies. Learn the signs to react quickly:</p>
              
              <div className="fast-signs">
                <div className="sign-block">
                  <strong>F - Face Drooping</strong>
                  <p>Does one side of the face droop or is it numb? Ask the person to smile.</p>
                </div>
                <div className="sign-block">
                  <strong>A - Arm Weakness</strong>
                  <p>Is one arm weak or numb? Ask the person to raise both arms. Does one arm drift downward?</p>
                </div>
                <div className="sign-block">
                  <strong>S - Speech Difficulty</strong>
                  <p>Is speech slurred? Are they unable to speak or hard to understand? Ask them to repeat a simple sentence.</p>
                </div>
                <div className="sign-block">
                  <strong>T - Time to call 911</strong>
                  <p>If the person shows any of these symptoms, even if the symptoms go away, call emergency services immediately.</p>
                </div>
              </div>
            </div>

            {/* Health Info */}
            <div className="glass-card info-card">
              <div className="info-icon-wrapper">
                <Heart size={32} />
              </div>
              <h3>Vascular Risk Factors</h3>
              <p>Strokes are preventable. Controlling key medical and lifestyle indicators significantly drops long term likelihood:</p>
              
              <div className="risk-factors">
                <div className="factor-item">
                  <h4>Hypertension (High Blood Pressure)</h4>
                  <p>The leading cause of stroke. High blood pressure strains cardiovascular walls, accelerating risk of rupturing or blocking blood flow.</p>
                </div>
                <div className="factor-item">
                  <h4>Diabetes & Blood Glucose</h4>
                  <p>Elevated blood glucose speeds up atherosclerosis, causing fatty deposits to narrow key brain-feeding arteries.</p>
                </div>
                <div className="factor-item">
                  <h4>Weight & BMI Standards</h4>
                  <p>Obesity increases strain on the heart, promotes chronic low-grade inflammation, and is closely linked to insulin resistance.</p>
                </div>
                <div className="factor-item">
                  <h4>Tobacco Use</h4>
                  <p>Smoking damages endothelial linings, elevates heartbeat frequency, and limits oxygen levels in blood vessels.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>&copy; 2026 NeuroShield Engine. For educational guidance only. Not a medical substitute.</p>
      </footer>
    </div>
  );
}

export default App;
