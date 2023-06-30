import { useContext, useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { getComments, createComment, deleteComment } from "../utils/requests";
import Spinner from './Spinner';

export default function Comments() {

  const { id } = useParams();
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    getComments(id)
      .then(data => {
        setComments([...comments, ...data.comments]);
        setCommentCount(data.commentCount);
      })
      .catch(error => {
        setError(error);
      })
      .finally(() => setIsLoaded(true));
  }, [])

  async function handleAddComment(content) {
    try {

      const data = await createComment(id, content);

      setCommentCount(commentCount + 1);
    
      let updatedComments = [data.comment, ...comments];
      setComments(updatedComments);

    } catch (error) {
      alert(error)
    }
  }

  async function handleDelete(id) {
    try {
      await deleteComment(id);
      
      const remainingComments = comments.filter(comment => comment.id !== id);

      setComments(remainingComments);
      setCommentCount(commentCount - 1);
    
    } catch (error) {
      alert(error)
    }
  }

  const commentList = comments.map(comment => (
    <Comment
      key={comment.id}
      comment={comment}
      handleDelete={handleDelete}
    />
  ))

  return (
    <div className="px-4">
      <h3 className="text-lg font-semibold my-4">This article's comments</h3>
      <Form
        handleAddComment={handleAddComment}
      />

      {commentCount > 0 ? (
        <ul>
          {commentList}
        </ul>
      ) : (
        <p className="text-center">This article has no comments.</p>
      )}

      {!isLoaded && <Spinner />}
      {error && <p className="text-red-500">{error.message}</p>}
    </div>
  )
}

function Form({ handleAddComment }) {
  
  const [content, setContent] = useState("");

  async function handleSubmit(e) {
    try {
      e.preventDefault();

      await handleAddComment(content);

      setContent("");

    } catch (error) {
      alert(error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <textarea
        rows="2"
        className="border w-full px-2 py-1 rounded"
        value={content}
        onChange={({ target }) => setContent(target.value)}
      />
      <button
        type="submit"
        className="bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-[0.2]"
        disabled={!content.trim()}
      >
        Post
      </button>
    </form>
  )
}

function Comment({ comment, handleDelete }) {

  const [active, setActive] = useState(false);

  async function handleClick() {
    try {
      await handleDelete(comment.id);
      setActive(false);
    } catch (error) {
      alert(error)
    }
  }

  function close(e) {
    if (e.target === e.currentTarget) {
      setActive(false);
    }
  }

  const modal = (
    <div className="fixed inset-0 flex justify-center items-center bg-black/[0.2] z-10" onClick={close}>
      <ul className="bg-white w-60 rounded-xl">
        <li className="border-b">
          <button
            className="w-full px-4 py-2 text-sm font-semibold text-red-500"
            onClick={handleClick}
          >
            Delete
          </button>
        </li>
        <li>
          <button
            className="text-sm font-semibold w-full px-4 py-2"
            onClick={() => setActive(false)}
          >
            Close
          </button>
        </li>
      </ul>
    </div>
  )
  
  return (
    <li className="py-4 flex border-b">
      {/* Author Avatar */}
      <div className="shrink-0">
        <Link to={`/profiles/${comment.author.username}`}>
          <img
            src={`${process.env.REACT_APP_SERVER}/files/profiles/${comment.author.avatar}`}
            className="w-8 h-8 object-cover border rounded-full"
          />
        </Link>
      </div>

      {/* Comment Content */}
      <div className="grow ml-4">
        <Link to={`/profiles/${comment.author.username}`} className="font-semibold">
          {comment.author.username} {" "}
        </Link>
        {comment.content}
        <p>
          <small className="font-xs text-gray-400">{comment.created}</small>
        </p>
      </div>

      {/* More button */}
      <div className="shrink-0 ml-4">
        {active && modal}
        <svg
          className="w-1 cursor-pointer"
          onClick={() => setActive(true)}
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 128 512"
          >
          <path d="M64 360C94.93 360 120 385.1 120 416C120 446.9 94.93 472 64 472C33.07 472 8 446.9 8 416C8 385.1 33.07 360 64 360zM64 200C94.93 200 120 225.1 120 256C120 286.9 94.93 312 64 312C33.07 312 8 286.9 8 256C8 225.1 33.07 200 64 200zM64 152C33.07 152 8 126.9 8 96C8 65.07 33.07 40 64 40C94.93 40 120 65.07 120 96C120 126.9 94.93 152 64 152z"/>
        </svg>
      </div>
    </li>
  )
}