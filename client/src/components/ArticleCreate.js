import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createArticle } from '../utils/requests';

export default function ArticleCreate({ active, setActive }) {

  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);

  async function handleSubmit(e) {
    try {
      e.preventDefault();

      const formData = new FormData();

      files.forEach(file => {
        formData.append('photos', file);
      })

      formData.append('description', description);

      await createArticle(formData);

      navigate('/');
      
    } catch (error) {
      alert(error);
    }
  }

  function close(e) {
    if (e.target === e.currentTarget) {
      setActive(false);
    }
  }

  if (active) {
    return (
      <div className="fixed inset-0 bg-black/[0.2] z-10" onClick={close}>
        {/* Modal Close Button */}
        <button
          type="button"
          className="float-right text-2xl px-4 py-2 text-white"
          onClick={() => setActive(false)}
        >
          &times;
        </button>

        {/* Create Form */}
        <form
          className="bg-white max-w-xs mt-20 mx-auto rounded-2xl"
          onSubmit={handleSubmit}
        >
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-center">Create new post</h3>
          </div>
          
          <div className="p-4">
            {/* Upload Button */}
            <label className="inline-block mb-2 font-semibold text-sm px-4 py-2 bg-gray-200 rounded-lg cursor-pointer">
              <input
                type="file"
                className="hidden"
                onChange={({ target }) => setFiles(Array.from(target.files))}
                multiple={true}
                accept="image/png, image/jpg, image/jpeg"
              />
              Select Photos +
            </label>

            {/* Chosen List */}
            {files.length > 0 && (
              <ul className="grid grid-cols-3 mb-2">
                {files.map(file => (
                  <li key={file.name} className="pt-[100%] relative">
                    <img 
                      className="absolute inset-0 w-full h-full object-cover" 
                      src={URL.createObjectURL(file)} 
                      alt={file.name} 
                    />
                  </li>
                ))}
              </ul>
            )}

            {/* Photo Caption */}
            <div className="mb-2">
              <label
                htmlFor="description"
                className="block font-semibold"
              >
                Description
              </label>
              <textarea
                rows="2"
                id="description"
                className="block w-full px-2 py-1 rounded border"
                onChange={({ target }) => setDescription(target.value)}
                value={description}
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold bg-blue-500 rounded-lg text-white disabled:opacity-[0.2]"
              disabled={files.length < 1}
            >
              Post
            </button>
          </div>
        </form>
      </div>
    )
  }
}