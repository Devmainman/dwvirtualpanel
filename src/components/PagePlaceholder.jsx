// src/components/PagePlaceholder.jsx
export default function PagePlaceholder({ title, description }) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">{description}</p>
          <div className="mt-4 p-8 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-400">Content for {title} goes here</p>
          </div>
        </div>
      </div>
    );
  }