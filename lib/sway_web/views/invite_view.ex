defmodule SwayWeb.InviteView do
  use SwayWeb, :view
  alias SwayWeb.InviteView

  def render("index.json", %{invites: invites}) do
    %{data: render_many(invites, InviteView, "invite.json")}
  end

  def render("show.json", %{invite: invite}) do
    %{
      data: render_one(invite, InviteView, "invite.json"),
    }
  end

  def render("invite.json", %{invite: invite}) do
    %{
      id: invite.id,
      name: invite.name,
      email: invite.email,
      workspace: render_one(invite.workspace, SwayWeb.WorkspaceView, "workspace.json"),
      created_by: render_one(invite.created_by, SwayWeb.UserView, "user.json"),
    }
  end

  def render("error.json", %{message: message}) do
    %{
      error: message
    }
  end
end
