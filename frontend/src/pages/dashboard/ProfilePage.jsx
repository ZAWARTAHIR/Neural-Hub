import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../lib/AuthContext.jsx";
import { AVATAR_TYPES, removeOldAvatars, saveProfile, uploadAvatar } from "../../lib/profile.js";
import Avatar from "../../components/dashboard/Avatar.jsx";
import { displayName } from "../../components/dashboard/channels.js";
import { Icon } from "../../components/icons/Icons.jsx";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const savedName = user?.user_metadata?.full_name || "";
  const savedAvatar = user?.user_metadata?.avatar_url || null;

  const [fullName, setFullName] = useState(savedName);
  const [file, setFile] = useState(null); // new picture waiting to be saved
  const [preview, setPreview] = useState(null);
  const [removed, setRemoved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null); // { type: "ok" | "error", text }
  const fileRef = useRef(null);

  // Local preview for a picked file.
  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const shownAvatar = preview || (removed ? null : savedAvatar);
  const dirty = fullName.trim() !== savedName || Boolean(file) || removed;

  function pickFile(event) {
    const next = event.target.files?.[0];
    event.target.value = "";
    if (!next) return;
    if (!AVATAR_TYPES.includes(next.type)) {
      return setStatus({ type: "error", text: "Please choose a JPG, PNG, WEBP or GIF image." });
    }
    if (next.size > 2 * 1024 * 1024) {
      return setStatus({ type: "error", text: "Image is too large. The maximum size is 2 MB." });
    }
    setStatus(null);
    setRemoved(false);
    setFile(next);
  }

  function removePhoto() {
    setFile(null);
    setRemoved(true);
    setStatus(null);
  }

  function reset() {
    setFullName(savedName);
    setFile(null);
    setRemoved(false);
    setStatus(null);
  }

  async function handleSave(event) {
    event.preventDefault();
    if (!dirty || saving) return;
    setSaving(true);
    setStatus(null);
    try {
      let avatarUrl = savedAvatar;
      if (file) avatarUrl = await uploadAvatar(user, file);
      else if (removed) {
        await removeOldAvatars(user);
        avatarUrl = null;
      }
      await saveProfile(user, { fullName: fullName.trim(), avatarUrl });
      setFile(null);
      setRemoved(false);
      setStatus({ type: "ok", text: "Profile updated." });
    } catch (err) {
      setStatus({ type: "error", text: err.message || "Something went wrong. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  const joined = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : "—";

  return (
    <div className="pf">
      <header className="pf-head">
        <h1>Profile</h1>
        <p>Manage how you appear across your Onefeed workspace.</p>
      </header>

      <form className="pf-card" onSubmit={handleSave}>
        <section className="pf-section">
          <div className="pf-section-text">
            <h2>Profile picture</h2>
            <p>JPG, PNG, WEBP or GIF. Max 2 MB. A square image works best.</p>
          </div>

          <div className="pf-avatar-row">
            <button type="button" className="pf-avatar-btn" onClick={() => fileRef.current?.click()} aria-label="Change profile picture">
              <Avatar user={user} src={shownAvatar} size={88} className="pf-avatar" />
              <span className="pf-avatar-overlay"><Icon name="image" size={20} /></span>
            </button>
            <div className="pf-avatar-actions">
              <button type="button" className="pf-btn pf-btn-secondary" onClick={() => fileRef.current?.click()}>
                {shownAvatar ? "Change photo" : "Upload photo"}
              </button>
              {shownAvatar && (
                <button type="button" className="pf-btn pf-btn-ghost" onClick={removePhoto}>
                  Remove
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept={AVATAR_TYPES.join(",")} onChange={pickFile} hidden />
          </div>
        </section>

        <section className="pf-section">
          <div className="pf-section-text">
            <h2>Personal details</h2>
            <p>Your name is shown in the sidebar and on your content.</p>
          </div>

          <div className="pf-fields">
            <label className="pf-field">
              <span>Full name</span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={displayName(user)}
                maxLength={80}
                autoComplete="name"
              />
            </label>
            <label className="pf-field">
              <span>Email</span>
              <input type="email" value={user?.email || ""} disabled readOnly />
              <small>Your sign-in email can&rsquo;t be changed here.</small>
            </label>
          </div>
        </section>

        <section className="pf-section">
          <div className="pf-section-text">
            <h2>Account</h2>
            <p>Details about your workspace access.</p>
          </div>
          <dl className="pf-meta">
            <div><dt>Role</dt><dd>Admin</dd></div>
            <div><dt>Member since</dt><dd>{joined}</dd></div>
          </dl>
        </section>

        <footer className="pf-foot">
          <span className={`pf-status ${status ? `is-${status.type}` : ""}`} role="status">
            {status?.type === "ok" && <Icon name="check" size={15} strokeWidth={2.6} />}
            {status?.text || (dirty ? "You have unsaved changes." : "")}
          </span>
          <div className="pf-foot-actions">
            <button type="button" className="pf-btn pf-btn-ghost" onClick={reset} disabled={!dirty || saving}>
              Cancel
            </button>
            <button type="submit" className="pf-btn pf-btn-primary" disabled={!dirty || saving}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </footer>
      </form>

      <div className="pf-card pf-danger">
        <div className="pf-section-text">
          <h2>Sign out</h2>
          <p>End your session on this device.</p>
        </div>
        <button type="button" className="pf-btn pf-btn-secondary" onClick={signOut}>
          <Icon name="signOut" size={15} />
          Sign out
        </button>
      </div>
    </div>
  );
}
