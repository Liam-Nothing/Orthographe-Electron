import { useState } from 'react'

function TestDesign({ setIsLoading, setLoadingMessage }) {
  const [hasValidated, setHasValidated] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    date: '',
    description: '',
    country: '',
    newsletter: false,
    gender: '',
    priority: 'medium'
  })

  const handleValidate = () => {
    setHasValidated(true)
    if (setIsLoading) {
      setIsLoading(true)
      setLoadingMessage('Processing...')
      
      setTimeout(() => {
        if (setIsLoading) {
          setIsLoading(false)
        }
      }, 2000)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  return (
    <div className="p-10 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="mb-8 text-4xl font-bold text-gray-800 border-b-4 border-primary pb-3">
        🎨 Test Design Page - Business Components
      </h1>

      {/* Headings Section */}
      <section className="bg-white p-8 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold text-primary mb-6">Headings (H1 - H6)</h2>
        <h1 className="my-3 text-gray-800">Heading 1 (H1)</h1>
        <h2 className="my-3 text-gray-700">Heading 2 (H2)</h2>
        <h3 className="my-3 text-gray-600">Heading 3 (H3)</h3>
        <h4 className="my-3 text-gray-600">Heading 4 (H4)</h4>
        <h5 className="my-3 text-gray-500">Heading 5 (H5)</h5>
        <h6 className="my-3 text-gray-500">Heading 6 (H6)</h6>
      </section>

      {/* Form Inputs Section */}
      <section className="bg-white p-8 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold text-primary mb-6">Form Inputs</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Text Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
            />
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="example@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
            />
          </div>

          {/* Number Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              placeholder="Enter age"
              min="0"
              max="120"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
            />
          </div>

          {/* Date Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
            />
          </div>

          {/* Select Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <select
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition bg-white"
            >
              <option value="">Select a country</option>
              <option value="fr">France</option>
              <option value="us">United States</option>
              <option value="uk">United Kingdom</option>
              <option value="de">Germany</option>
              <option value="es">Spain</option>
            </select>
          </div>
        </div>

        {/* Textarea */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="4"
            placeholder="Enter a description..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition resize-none"
          />
        </div>

        {/* Checkbox */}
        <div className="mt-6 flex items-center">
          <input
            type="checkbox"
            name="newsletter"
            id="newsletter"
            checked={formData.newsletter}
            onChange={handleInputChange}
            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
          />
          <label htmlFor="newsletter" className="ml-2 text-sm text-gray-700">
            Subscribe to newsletter
          </label>
        </div>

        {/* Radio Buttons */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Gender
          </label>
          <div className="flex gap-6">
            <label className="flex items-center">
              <input
                type="radio"
                name="gender"
                value="male"
                checked={formData.gender === 'male'}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-700">Male</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="gender"
                value="female"
                checked={formData.gender === 'female'}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-700">Female</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="gender"
                value="other"
                checked={formData.gender === 'other'}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-700">Other</span>
            </label>
          </div>
        </div>
      </section>

      {/* Buttons Section */}
      <section className="bg-white p-8 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold text-primary mb-6">Buttons with Hover Effects</h2>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <button className="px-6 py-3 bg-primary text-white rounded-lg font-semibold transition-all duration-300 hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-lg">
            Primary Button
          </button>

          <button className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold transition-all duration-300 hover:bg-green-600 hover:-translate-y-0.5 hover:shadow-lg">
            Success Button
          </button>

          <button className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold transition-all duration-300 hover:bg-red-600 hover:-translate-y-0.5 hover:shadow-lg">
            Danger Button
          </button>

          <button className="px-6 py-3 bg-yellow-400 text-gray-800 rounded-lg font-semibold transition-all duration-300 hover:bg-yellow-500 hover:-translate-y-0.5 hover:shadow-lg">
            Warning Button
          </button>

          <button className="px-6 py-3 bg-transparent text-primary border-2 border-primary rounded-lg font-semibold transition-all duration-300 hover:bg-primary hover:text-white hover:-translate-y-0.5">
            Outline Button
          </button>

          <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold transition-all duration-300 hover:bg-gray-300 hover:-translate-y-0.5">
            Secondary Button
          </button>
        </div>

        {/* Validate Loading Button */}
        <div className="mt-8 pt-6 border-t-2 border-gray-200">
          <h3 className="text-xl font-semibold text-primary mb-4">Validate Loading Button</h3>
          {!hasValidated ? (
            <button
              onClick={handleValidate}
              className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-bold text-lg transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-xl"
            >
              Validate Loading
            </button>
          ) : (
            <p className="text-green-600 text-lg font-semibold">
              ✅ Loading validated!
            </p>
          )}
        </div>
      </section>

      {/* Cards Section */}
      <section className="bg-white p-8 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold text-primary mb-6">Cards</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Card Title</h3>
            <p className="text-gray-600 mb-4">This is a simple card component with hover effect.</p>
            <button className="text-primary font-medium hover:underline">Learn more →</button>
          </div>

          <div className="border border-gray-200 rounded-lg p-6 bg-gradient-to-br from-primary to-secondary text-white hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-2">Gradient Card</h3>
            <p className="mb-4 opacity-90">A card with gradient background.</p>
            <button className="bg-white text-primary px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition">
              Action
            </button>
          </div>

          <div className="border-2 border-primary rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Bordered Card</h3>
            <p className="text-gray-600 mb-4">Card with colored border.</p>
            <span className="inline-block bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
              Badge
            </span>
          </div>
        </div>
      </section>

      {/* Table Section */}
      <section className="bg-white p-8 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold text-primary mb-6">Data Table</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">ID</th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-3">1</td>
                <td className="border border-gray-300 px-4 py-3">John Doe</td>
                <td className="border border-gray-300 px-4 py-3">john@example.com</td>
                <td className="border border-gray-300 px-4 py-3">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Active</span>
                </td>
                <td className="border border-gray-300 px-4 py-3">
                  <button className="text-primary hover:underline mr-3">Edit</button>
                  <button className="text-red-500 hover:underline">Delete</button>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-3">2</td>
                <td className="border border-gray-300 px-4 py-3">Jane Smith</td>
                <td className="border border-gray-300 px-4 py-3">jane@example.com</td>
                <td className="border border-gray-300 px-4 py-3">
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">Pending</span>
                </td>
                <td className="border border-gray-300 px-4 py-3">
                  <button className="text-primary hover:underline mr-3">Edit</button>
                  <button className="text-red-500 hover:underline">Delete</button>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-3">3</td>
                <td className="border border-gray-300 px-4 py-3">Bob Johnson</td>
                <td className="border border-gray-300 px-4 py-3">bob@example.com</td>
                <td className="border border-gray-300 px-4 py-3">
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Inactive</span>
                </td>
                <td className="border border-gray-300 px-4 py-3">
                  <button className="text-primary hover:underline mr-3">Edit</button>
                  <button className="text-red-500 hover:underline">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Alerts Section */}
      <section className="bg-white p-8 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold text-primary mb-6">Alerts & Notifications</h2>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <div className="flex items-center">
              <div className="flex-shrink-0 pt-0.5">
                <span className="text-blue-500 text-xl">ℹ️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Info:</strong> This is an informational message.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <div className="flex items-center">
              <div className="flex-shrink-0 pt-0.5">
                <span className="text-green-500 text-xl">✅</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  <strong>Success:</strong> Operation completed successfully!
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <div className="flex items-center">
              <div className="flex-shrink-0 pt-0.5">
                <span className="text-yellow-500 text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Warning:</strong> Please review this information.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-center">
              <div className="flex-shrink-0 pt-0.5">
                <span className="text-red-500 text-xl">❌</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  <strong>Error:</strong> Something went wrong. Please try again.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Badges Section */}
      <section className="bg-white p-8 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold text-primary mb-6">Badges & Tags</h2>
        
        <div className="flex flex-wrap gap-3">
          <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">Primary</span>
          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">Success</span>
          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">Danger</span>
          <span className="bg-yellow-400 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">Warning</span>
          <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-medium">Secondary</span>
          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">Info</span>
        </div>
      </section>

      {/* Progress Bars Section */}
      <section className="bg-white p-8 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold text-primary mb-6">Progress Bars</h2>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress 25%</span>
              <span className="text-sm text-gray-500">25%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-primary h-3 rounded-full" style={{ width: '25%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress 50%</span>
              <span className="text-sm text-gray-500">50%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-green-500 h-3 rounded-full" style={{ width: '50%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress 75%</span>
              <span className="text-sm text-gray-500">75%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-yellow-400 h-3 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress 100%</span>
              <span className="text-sm text-gray-500">100%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-green-500 h-3 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Paragraphs Section */}
      <section className="bg-white p-8 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold text-primary mb-6">Typography</h2>
        <p className="text-base leading-relaxed text-gray-700 mb-4">
          This is a regular paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
          Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <p className="text-sm leading-normal text-gray-600 mb-4">
          This is a smaller paragraph with different styling. Ut enim ad minim veniam, 
          quis nostrud exercitation ullamco laboris.
        </p>
        <p className="text-lg leading-loose text-gray-800 font-medium">
          This is a larger, bold paragraph for emphasis.
        </p>
      </section>
    </div>
  )
}

export default TestDesign
