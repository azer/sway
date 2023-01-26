defmodule SwayWeb.InviteControllerTest do
  use SwayWeb.ConnCase

  import Sway.InvitesFixtures

  alias Sway.Invites.Invite

  @create_attrs %{
    email: "some email"
  }
  @update_attrs %{
    email: "some updated email"
  }
  @invalid_attrs %{email: nil}

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "index" do
    test "lists all invites", %{conn: conn} do
      conn = get(conn, Routes.invite_path(conn, :index))
      assert json_response(conn, 200)["data"] == []
    end
  end

  describe "create invite" do
    test "renders invite when data is valid", %{conn: conn} do
      conn = post(conn, Routes.invite_path(conn, :create), invite: @create_attrs)
      assert %{"id" => id} = json_response(conn, 201)["data"]

      conn = get(conn, Routes.invite_path(conn, :show, id))

      assert %{
               "id" => ^id,
               "email" => "some email"
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, Routes.invite_path(conn, :create), invite: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "update invite" do
    setup [:create_invite]

    test "renders invite when data is valid", %{conn: conn, invite: %Invite{id: id} = invite} do
      conn = put(conn, Routes.invite_path(conn, :update, invite), invite: @update_attrs)
      assert %{"id" => ^id} = json_response(conn, 200)["data"]

      conn = get(conn, Routes.invite_path(conn, :show, id))

      assert %{
               "id" => ^id,
               "email" => "some updated email"
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn, invite: invite} do
      conn = put(conn, Routes.invite_path(conn, :update, invite), invite: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "delete invite" do
    setup [:create_invite]

    test "deletes chosen invite", %{conn: conn, invite: invite} do
      conn = delete(conn, Routes.invite_path(conn, :delete, invite))
      assert response(conn, 204)

      assert_error_sent 404, fn ->
        get(conn, Routes.invite_path(conn, :show, invite))
      end
    end
  end

  defp create_invite(_) do
    invite = invite_fixture()
    %{invite: invite}
  end
end
