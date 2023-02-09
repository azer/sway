defmodule SwayWeb.InviteEmail do
  import Swoosh.Email
  import Sway.Mailer

  def welcome(invite, token) do
    new()
    |> to({invite.name, invite.email})
    |> from(Sway.Mailer.from())
    |> subject("#{invite.created_by.name} invited you to #{invite.workspace.name}")
    |> html_body(~s"""
    <div style="background-color:#fff; padding: 20px 30px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;">
      <div>Hey #{invite.name},</div>
      <div style="margin: 10px 0;">
        <strong>#{invite.created_by.name}</strong> invited you to
        <strong>#{invite.workspace.name}</strong>.
      </div>
      <a href="https://sway.so/join?invite=#{token}" style="color: rgb(38, 150, 255); display: inline-block;"
        >Click here to join.</a
      >
      <div style="margin-top: 30px;">
        <img src="https://cldup.com/HIL47P0PRk.png" style="width: 35px;" />
        <div style="font-size: 13px; color: #888; line-height: 18px">
          <a href="https://sway.so" style="color: #888;">Sway.so</a>, remote communication<br /> with
          in-person feel.
        </div>
      </div>
    </div>
    """)
  end
end
