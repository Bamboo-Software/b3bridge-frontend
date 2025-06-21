import { RouterProvider } from 'react-router-dom';
import routes from '@/app/routers';


function App() {
  return (
    <RouterProvider router={routes} />
  )
}

export default App;
