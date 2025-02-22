defmodule SwayWeb.UserController do
  use SwayWeb, :controller

  alias Sway.Accounts
  alias Sway.Accounts.User

  action_fallback SwayWeb.FallbackController

  def list_by_workspace(conn, %{"workspace_id" => %{"eq" => raw_workspace_id}}) do
    workspace_id = SwayWeb.Hashing.decode_workspace(raw_workspace_id)
    user = Guardian.Plug.current_resource(conn)

    with {:ok, true} <- Sway.Workspaces.has_workspace_access?(user.id, workspace_id) do
      users = Sway.Workspaces.list_users_by_workspace(workspace_id)
      render(conn, "index.json", users: users)
    else
      {:ok, false} ->
        conn
        |> put_status(:forbidden)
        |> json(%{error: "User does not have access to this workspace"})

      {:error, error} ->
        conn
        |> put_status(:internal_)
        |> json(%{error: error})
    end
  end

  def create(conn, %{"user" => user_params}) do
    with {:ok, %User{} = user} <- Accounts.create_user(user_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", Routes.user_path(conn, :show, user))
      |> render("show.json", user: user)
    end
  end

  def show(conn, %{"id" => id}) do
    user = Accounts.get_user!(SwayWeb.Hashing.decode_user(id))
    render(conn, "show.json", user: user)
  end

  def update(conn, %{"id" => id, "user" => user_params}) do
    user = Accounts.get_user!(SwayWeb.Hashing.decode_user(id))

    IO.inspect(user_params, label: "Updating user " <> id)

    with {:ok, %User{} = user} <- Accounts.update_user(user, user_params) do
      render(conn, "show.json", user: user)
    end
  end

  def delete(conn, %{"id" => id}) do
    user = Accounts.get_user!(id)

    with {:ok, %User{}} <- Accounts.delete_user(user) do
      send_resp(conn, :no_content, "")
    end
  end
end
