import PropTypes from "prop-types";
export default function Notification({ message }) {
  const style = message.type === "error" ? "error" : "success";
  if (message.type === null) {
    return null;
  }
  return <div className={style}>{message.content}</div>;
}

Notification.propTypes = {
  message: PropTypes.object.isRequired,
};
