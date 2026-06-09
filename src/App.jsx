
import { Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './pages/Login/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import Transaction from './pages/Transaction/Transaction'
import Notfound from './pages/Notfound/Notfound'
import Authentication from './pages/Authentication/Authentication'
import MainLayout from './layout/MainLayout/MainLayout'
import ProtectedRoutes from './routes/ProtectedRoutes'



function App() {


  return (

    <Routes>
      <Route path='/login' element={<Login/>} />
      <Route  element={<ProtectedRoutes><MainLayout/></ProtectedRoutes>} >

      <Route path='/dashboard' element={<ProtectedRoutes><Dashboard/></ProtectedRoutes>} />
      <Route path='/transaction' element={<ProtectedRoutes><Transaction/></ProtectedRoutes>} />
      <Route path='/authentication' element={<ProtectedRoutes><Authentication/></ProtectedRoutes>} />

      </Route>
      
      <Route path='*' element={<Notfound/>} />

    </Routes>

 
  )
}

export default App

// path='/mainlayout'  چون والده باید برداریم یا / رو از بفیه برداریم
