defmodule SwayWeb.InviteEmail do
  import Swoosh.Email
  import Sway.Mailer

  def welcome(invite, token) do
    new()
    |> to({invite.name, invite.email})
    |> from(Sway.Mailer.from())
    |> subject("#{invite.created_by.name} invited you to #{invite.workspace.name}")
    |> html_body(action_email_template(invite.name, "Click here to join.", "https://sway.so/join?invite=#{token}", ~s"""
        <strong>#{invite.created_by.name}</strong> invited you to
        <strong>#{invite.workspace.name}</strong>.
    """))
  end

  def email_template(contents) do
    ~s"""
     <div style="background-color:#fff; padding: 20px 30px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;">
     #{contents}
      <div style="margin-top: 30px;">
        <img src="https://cldup.com/HIL47P0PRk.png" style="width: 35px;" />
        <div style="font-size: 13px; color: #888; line-height: 18px">
          <a href="https://sway.so" style="color: #888;">Sway.so</a>, remote communication<br /> with
          in-person feel.
        </div>
      </div>
    </div>
    """
  end

  def action_email_template(name, label, url, contents) do
    email_template(~s"""
      <div>Hey #{name},</div>
      <div style="margin: 10px 0;">
        #{contents}
      </div>
      <a href="#{url}" style="color: rgb(38, 150, 255); display: inline-block;"
        >#{label}</a
      >
    """)
  end
end
