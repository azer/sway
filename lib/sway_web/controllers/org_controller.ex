defmodule SwayWeb.OrgController do
  use SwayWeb, :controller

  alias Sway.Accounts
  alias Sway.Accounts.Org

  action_fallback SwayWeb.FallbackController

  def index(conn, _params) do
    orgs = Accounts.list_orgs()
    render(conn, "index.json", orgs: orgs)
  end

  def create(conn, %{"org" => org_params}) do
    with {:ok, %Org{} = org} <- Accounts.create_org(org_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", Routes.org_path(conn, :show, org))
      |> render("show.json", org: org)
    end
  end

  def show(conn, %{"id" => id}) do
    org = Accounts.get_org!(id)
    render(conn, "show.json", org: org)
  end

  def update(conn, %{"id" => id, "org" => org_params}) do
    org = Accounts.get_org!(id)

    with {:ok, %Org{} = org} <- Accounts.update_org(org, org_params) do
      render(conn, "show.json", org: org)
    end
  end

  def delete(conn, %{"id" => id}) do
    org = Accounts.get_org!(id)

    with {:ok, %Org{}} <- Accounts.delete_org(org) do
      send_resp(conn, :no_content, "")
    end
  end
end
