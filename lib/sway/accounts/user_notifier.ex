

defmodule Sway.Accounts.UserNotifier do
  import Swoosh.Email

  alias Sway.Mailer

  # Delivers the email using the application mailer.
  defp deliver(recipient, subject, body) do
    email =
      new()
      |> to(recipient)
      |> from(Sway.Mailer.from())
      |> subject(subject)
      |> html_body(body)

    with {:ok, _metadata} <- Mailer.deliver(email) do
      {:ok, email}
    end
  end

  @doc """
  Deliver instructions to confirm account.
  """
  def deliver_confirmation_instructions(user, url) do
    deliver(user.email, "Confirm your Sway account", SwayWeb.InviteEmail.action_email_template(user.name, "Confirm my account", url, ~s"""
    Welcome to Sway ✨. Please confirm your account by clicking the link below.
    """))
  end

  @doc """
  Deliver instructions to reset a user password.
  """
  def deliver_reset_password_instructions(user, url) do
    deliver(user.email, "Reset your Sway password", SwayWeb.InviteEmail.action_email_template(user.name, "Reset my password", url, ~s"""
    We received a request to reset your password. Click the link below to set a new password for your Sway account.
    """))
  end

  @doc """
  Deliver instructions to update a user email.
  """
  def deliver_update_email_instructions(user, url) do
    deliver(user.email, "Update email instructions", """

    ==============================

    Hi #{user.email},

    You can change your email by visiting the URL below:

    #{url}

    If you didn't request this change, please ignore this.

    ==============================
    """)
  end
end
