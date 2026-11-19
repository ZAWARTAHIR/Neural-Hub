import MediaLibrary from "../../components/dashboard/MediaLibrary.jsx";

export default function VideoPage() {
  return (
    <MediaLibrary
      kind="video"
      title="Videos"
      noun="video"
      icon="video"
      description="Every short-form video generated from your campaigns."
    />
  );
}
