
import { Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './pages/Login/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import VouchersList from './pages/Financial/Vouchers/VouchersList'
import VoucherDetail from './pages/Financial/Vouchers/VoucherDetail'
import VoucherNew from './pages/Financial/Vouchers/VoucherNew'
import Notfound from './pages/Notfound/Notfound'
import Authentication from './pages/Authentication/Authentication'
import MainLayout from './layout/MainLayout/MainLayout'
import ProtectedRoutes from './routes/ProtectedRoutes'



function App() {


  return (

    <Routes>
      <Route path='/login' element={<Login/>} />
      <Route  element={<ProtectedRoutes><MainLayout/></ProtectedRoutes>} >

      <Route path='/dashboard' element={<Dashboard/>} />
      <Route path='/Vouchers' element={<VouchersList/>} />
      <Route path='/Vouchers/VoucherNew' element={<VoucherNew/>}/>
      <Route path='/Vouchers/:id' element={<VoucherDetail/>} />

      <Route path='/authentication' element={<Authentication/>} />

      </Route>
      
      <Route path='*' element={<Notfound/>} />

    </Routes>

 
  )
}

export default App

// path='/mainlayout'  چون والده باید برداریم یا / رو از بفیه برداریم
