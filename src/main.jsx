import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter} from 'react-router-dom'
import {AuthProvider} from './context/AuthProvider.jsx'
import TabProvider from "./context/TabProvider";
import { ThemeProvider, GlobalStyles } from "@mui/material";
import { Theme } from "./theme/Theme";






createRoot(document.getElementById('root')).render(


  <StrictMode>
    
    <ThemeProvider theme={Theme}><GlobalStyles styles={Theme.components.MuiCssBaseline.styleOverrides} />
    <div dir="rtl"><BrowserRouter>
    <AuthProvider>
        <TabProvider>      
            <App/>
        </TabProvider> 
    </AuthProvider>
    </BrowserRouter></div>
    </ThemeProvider>
    
  </StrictMode>,
)
