defmodule SwayWeb.WorkspaceControllerTest do
  use SwayWeb.ConnCase

  import Sway.WorkspacesFixtures

  alias Sway.Workspaces.Workspace

  @create_attrs %{
    domain: "some domain",
    logo_url: "some logo_url",
    name: "some name"
  }
  @update_attrs %{
    domain: "some updated domain",
    logo_url: "some updated logo_url",
    name: "some updated name"
  }
  @invalid_attrs %{domain: nil, logo_url: nil, name: nil}

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "index" do
    test "lists all workspaces", %{conn: conn} do
      conn = get(conn, Routes.workspace_path(conn, :index))
      assert json_response(conn, 200)["data"] == []
    end
  end

  describe "create workspace" do
    test "renders workspace when data is valid", %{conn: conn} do
      conn = post(conn, Routes.workspace_path(conn, :create), workspace: @create_attrs)
      assert %{"id" => id} = json_response(conn, 201)["data"]

      conn = get(conn, Routes.workspace_path(conn, :show, id))

      assert %{
               "id" => ^id,
               "domain" => "some domain",
               "logo_url" => "some logo_url",
               "name" => "some name"
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, Routes.workspace_path(conn, :create), workspace: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "update workspace" do
    setup [:create_workspace]

    test "renders workspace when data is valid", %{conn: conn, workspace: %Workspace{id: id} = workspace} do
      conn = put(conn, Routes.workspace_path(conn, :update, workspace), workspace: @update_attrs)
      assert %{"id" => ^id} = json_response(conn, 200)["data"]

      conn = get(conn, Routes.workspace_path(conn, :show, id))

      assert %{
               "id" => ^id,
               "domain" => "some updated domain",
               "logo_url" => "some updated logo_url",
               "name" => "some updated name"
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn, workspace: workspace} do
      conn = put(conn, Routes.workspace_path(conn, :update, workspace), workspace: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "delete workspace" do
    setup [:create_workspace]

    test "deletes chosen workspace", %{conn: conn, workspace: workspace} do
      conn = delete(conn, Routes.workspace_path(conn, :delete, workspace))
      assert response(conn, 204)

      assert_error_sent 404, fn ->
        get(conn, Routes.workspace_path(conn, :show, workspace))
      end
    end
  end

  defp create_workspace(_) do
    workspace = workspace_fixture()
    %{workspace: workspace}
  end
end
