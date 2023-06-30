import { useState, useEffect, useRef } from "react";
import { getProfiles } from "../utils/requests";
import { Link } from "react-router-dom";
import Spinner from './Spinner';

export default function Search() {

  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(true);
  const [profiles, setProfiles] = useState([]);
  const inputEl = useRef(null);

  // tracking
  console.log(profiles)

  async function handleChange(e) {
    try {    
      const username = e.target.value;
  
      if (!username) {
        return setProfiles([]);
      }
  
      setError(null);
      setIsLoaded(false);
  
      const { profiles } = await getProfiles(username);
      
      setProfiles(profiles);

      setIsLoaded(true);

    } catch (error) {
      setError(error)
    }
  }

  useEffect(() => {
    inputEl.current.focus();
  })

  return (
    <div className="px-4">
      <h3 className="text-lg font-semibold my-4">Explore</h3>
      <label className="block mb-4">
        <input
          type="text"
          className="border px-2 py-1 rounded w-full"
          onChange={handleChange}
          placeholder="Search"
          ref={inputEl}
        />
      </label>

      <Result 
        error={error} 
        isLoaded={isLoaded} 
        profiles={profiles}
      />
    </div>
  )
}

function Result({ error, isLoaded, profiles }) {
  if (error) {
    return <p className="text-red-500">{error.message}</p>
  }
  
  if (!isLoaded) {
    return <Spinner />
  }

  const profileList = profiles.map(profile => (
    <li key={profile.username} className="flex items-center justify-between my-2">
      <Link
        to={`/profiles/${profile.username}`}
        className="flex items-center"
      >
        <img
          src={`${process.env.REACT_APP_SERVER}/files/profiles/${profile.avatar}`}
          className="w-10 h-10 object-cover rounded-full"
        />
        <div className="ml-2">
          <span className="block font-semibold">
            {profile.username}
          </span>
          <span className="block text-gray-400 text-sm">
            {profile.fullName}
          </span>
        </div>
      </Link>
      {/* Follwing Status */}
      {profile.isFollowing && (
        <div className="ml-2 text-sm text-blue-500 font-semibold">following</div>
      )}
    </li>
  ))

  return (
    <ul>
      {profileList}
    </ul>  
  )
}
