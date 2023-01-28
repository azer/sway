defmodule SwayWeb.InviteEmail do
  import Swoosh.Email
  import Sway.Mailer

  def welcome(invite) do
    token = Phoenix.Token.sign(SwayWeb.Endpoint, "salt", invite.id)

    new()
    |> to({invite.name, invite.email})
    |> from(Sway.Mailer.from())
    |> subject("#{invite.created_by.name} invited you to #{invite.workspace.name}")
#|> html_body("<h1>Hello #{invite.name} #{token}</h1>")
    |> text_body("Hey #{invite.name},\n\n#{invite.created_by.name} invited you to #{invite.workspace.name}. Click the link below: https://sway.so/users/signup?invite=#{token} \n\nSway - Video chat rooms for remote teams.")
  end
end
