import Head from 'next/head'
import Sidebar from '../components/Sidebar'

export default function Home() {
  return (
    <div className="h-screen overflow-hidden bg-black">
      <main>
        <Sidebar />
        {/* center */}

      </main>
      <div>
        {/* player */}
      </div>
    </div>
  )
}
