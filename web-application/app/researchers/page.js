'use client'

const researchers = [
  {
    name: "Igor Marchenko",
    url: "https://www.linkedin.com/in/marczenko",
    image: "/igor.webp"
  },
  {
    name: "Jan Kokowski", 
    url: "https://www.linkedin.com/in/jan-kokowski-a21293110/",
    image: "/jan.webp"
  },
  {
    name: "Stella S.",
    url: "https://www.linkedin.com/in/stellasiu0427/",
    image: "/stella.webp"
  }
]

const researchPaper = {
  title: "Listener Perceptions of Accented Synthetic Speech: Analyzing the Impact of L1",
  url: "https://drive.google.com/file/d/1WgOsbC7yM11WRXOFCqcsJiJHbl1NDgo-/view?usp=sharing"
}

export default function Researchers() {
  const openLink = (url) => {
    window.open(url, '_blank')
  }

  const LinkedInIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Research Team
          </h1>
          <p className="text-gray-600">Connect with the researchers</p>
        </div>

        {/* Researcher Cards */}
        <div className="space-y-4 mb-8">
          {researchers.map((researcher, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                {/* Profile Image */}
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                  <img 
                    src={researcher.image}
                    alt={researcher.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full hidden items-center justify-center text-white text-lg font-bold">
                    {researcher.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
                
                {/* Name */}
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {researcher.name}
                  </h3>
                </div>
                
                {/* LinkedIn Button */}
                <button
                  onClick={() => openLink(researcher.url)}
                  className="bg-[#0077B5] hover:bg-[#005885] text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95"
                >
                  <LinkedInIcon />
                  <span className="text-sm">LinkedIn</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Research Paper */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg border border-purple-100">
          <div className="flex flex-col space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xl text-white">📄</span>
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-gray-800 leading-tight mb-2">
                  {researchPaper.title}
                </h3>
                <p className="text-sm text-gray-600">
                  Research Publication
                </p>
              </div>
            </div>
            <button
              onClick={() => openLink(researchPaper.url)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
              </svg>
              <span>Read Full Paper</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}