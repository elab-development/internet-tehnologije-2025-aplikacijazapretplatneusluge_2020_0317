import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter } from "react-router-dom";
import App from './App';
import reportWebVitals from './reportWebVitals';
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

const DORANGE = "#663000";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <MantineProvider
        theme={{
          fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
          colors: {
            orange: [
              "#fff5e7",
              "#ffefd1",
              "#ffe2a3",
              "#ffc875",
              "#ffb84e",
              "#ffa52f",
              "#e8961c",
              "#c27013",
              "#92590e",
              DORANGE,
            ],
          },
          primaryColor: "orange",
          components: {
            Button: { defaultProps: { radius: "xl" } },
            Paper: { defaultProps: { radius: "xl" } },
          },
        }}
        defaultColorScheme="light"
      >
        <Notifications position="top-right" />
        <App />
      </MantineProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
