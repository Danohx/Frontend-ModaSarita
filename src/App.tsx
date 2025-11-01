import { Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'

function App() {  
  return (
    <div className="app-container">
      {/* Outlet es la "salida" de React Router.
        Aquí es donde se renderizará tu página de Login,
        tu página de Registro, etc.
      */}
      <main>
        <Navbar />
        <Outlet /> 
      </main>
    </div>
  )
}

export default App