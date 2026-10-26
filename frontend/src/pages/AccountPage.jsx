
import { useState } from "react";
import {
  updateAccountEmail,
  changeAccountPassword,
  deleteAccount,
} from "../api/client";

function AccountPage({
  user,
  onUserUpdated,
  onOpenProfile,
  onOpenGoals,
  onLogout,
}) {
  const [email, setEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleEmailUpdate(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setBusy("email");

    try {
      const updatedUser = await updateAccountEmail(email.trim());

      onUserUpdated(updatedUser);
      setEmail(updatedUser.email);
      setMessage("Email address updated successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function handlePasswordUpdate(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("The new passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Your new password must contain at least 8 characters.");
      return;
    }

    setBusy("password");

    try {
      await changeAccountPassword(currentPassword, newPassword);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Sign out this browser after a successful password change.
      onLogout();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirmation !== "DELETE") return;

    const confirmed = window.confirm(
      "Permanently delete your account and all its data? This cannot be undone."
    );

    if (!confirmed) return;

    setError("");
    setMessage("");
    setBusy("delete");

    try {
      await deleteAccount();
      onLogout();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  return (
    <>
      <div className="profile-header">
        <div>
          <p className="subtitle">YOUR ACCOUNT</p>
          <h1>Account settings</h1>
          <p className="description">
            Manage your profile, nutrition goals and login details.
          </p>
        </div>

        <button className="secondary-button" onClick={onLogout}>
          Log out
        </button>
      </div>

      <div className="account-stack">
        <section className="account-card">
          <h3>Nutrition settings</h3>
          <p>
            Update your personal details or change your daily
            calorie and macro targets.
          </p>

          <div className="account-actions">
            <button onClick={onOpenProfile}>
              My profile
            </button>

            <button
              className="secondary-button"
              onClick={onOpenGoals}
            >
              Nutrition goals
            </button>
          </div>
        </section>

        <section className="account-card">
          <h3>Email address</h3>
          <p>Current email: {user.email}</p>

          <form onSubmit={handleEmailUpdate}>
            <div className="profile-field">
              <label htmlFor="account-email">Email</label>
              <input
                id="account-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <button
              type="submit"
              disabled={Boolean(busy) || email.trim() === user.email}
              className="account-submit"
            >
              {busy === "email" ? "Saving..." : "Update email"}
            </button>
          </form>
        </section>

        <section className="account-card">
          <h3>Change password</h3>
          <p>
            Update your password to keep your account secure.
            You'll be signed out of this browser afterwards.
          </p>

          <form onSubmit={handlePasswordUpdate}>
            <div className="account-fields">
              <div className="profile-field">
                <label htmlFor="current-password">
                  Current password
                </label>
                <input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(event) =>
                    setCurrentPassword(event.target.value)
                  }
                  autoComplete="current-password"
                  required
                />
              </div>

              <div className="profile-field">
                <label htmlFor="new-password">
                  New password
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(event.target.value)
                  }
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>

              <div className="profile-field">
                <label htmlFor="confirm-password">
                  Confirm new password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="account-submit"
              disabled={Boolean(busy)}
            >
              {busy === "password"
                ? "Updating..."
                : "Change password"}
            </button>
          </form>
        </section>

        <section className="account-card account-danger">
          <h3>Delete account</h3>
          <p>
            Permanently remove your account, profile, nutrition goals
            and logged foods. This action cannot be undone.
          </p>

          <div className="profile-field">
            <label htmlFor="delete-confirmation">
              Type DELETE to confirm
            </label>
            <input
              id="delete-confirmation"
              type="text"
              value={deleteConfirmation}
              onChange={(event) =>
                setDeleteConfirmation(event.target.value)
              }
              placeholder="DELETE"
              autoComplete="off"
            />
          </div>

          <button
            type="button"
            className="account-delete-button"
            onClick={handleDeleteAccount}
            disabled={Boolean(busy) || deleteConfirmation !== "DELETE"}
          >
            {busy === "delete"
              ? "Deleting..."
              : "Permanently delete account"}
          </button>
        </section>

        {error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}

        {message && (
          <p role="status" className="account-success">
            {message}
          </p>
        )}
      </div>
    </>
  );
}

export default AccountPage;
