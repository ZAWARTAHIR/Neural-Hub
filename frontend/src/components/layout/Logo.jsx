import { Link } from "react-router-dom";
import { BoltIcon } from "../icons/Icons.jsx";

export default function Logo({ onClick }) {
  return (
    <Link to="/" className="logo" onClick={onClick}>
      <span className="mark-icon">
        <BoltIcon size={18} />
      </span>
      <span>Onefeed</span>
    </Link>
  );
}
