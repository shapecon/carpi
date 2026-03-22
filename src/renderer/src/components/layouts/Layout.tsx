import { Outlet } from 'react-router'

export const Layout = () => {
  return (
    <div
      id="main-root"
      style={{
        width: '100%',
        height: '100%'
      }}
    >
      <Outlet />
    </div>
  )
}
