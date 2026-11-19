import MediaLibrary from "../../components/dashboard/MediaLibrary.jsx";

export default function GifPage() {
  return (
    <MediaLibrary
      kind="gif"
      title="GIFs"
      noun="GIF"
      icon="gif"
      description="Every animated GIF generated from your campaigns."
    />
  );
}
