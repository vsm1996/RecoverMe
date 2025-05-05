import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Custom CSS Variables for the app
document.documentElement.style.setProperty('--primary', '#64B5F6');
document.documentElement.style.setProperty('--secondary', '#81C784');
document.documentElement.style.setProperty('--accent', '#FFB74D');
document.documentElement.style.setProperty('--background', '#F5F5F5');
document.documentElement.style.setProperty('--text-dark', '#424242');

// Apply the custom font families
document.documentElement.style.fontFamily = "'Open Sans', sans-serif";

createRoot(document.getElementById("root")!).render(<App />);
