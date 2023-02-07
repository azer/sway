defmodule SwayWeb.InviteEmail do
  import Swoosh.Email
  import Sway.Mailer

  def welcome(invite, token) do
    new()
    |> to({invite.name, invite.email})
    |> from(Sway.Mailer.from())
    |> subject("#{invite.created_by.name} invited you to #{invite.workspace.name}")
    |> text_body("Hey #{invite.name},\n\n#{invite.created_by.name} invited you to #{invite.workspace.name}. Click the link below: https://sway.so/join?invite=#{token} \n\nSway - Video chat rooms for remote teams.")
  end
end
