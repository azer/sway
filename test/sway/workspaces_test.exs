defmodule Sway.WorkspacesTest do
  use Sway.DataCase

  alias Sway.Workspaces

  describe "workspaces" do
    alias Sway.Workspaces.Workspace

    import Sway.WorkspacesFixtures

    @invalid_attrs %{domain: nil, logo_url: nil, name: nil}

    test "list_workspaces/0 returns all workspaces" do
      workspace = workspace_fixture()
      assert Workspaces.list_workspaces() == [workspace]
    end

    test "get_workspace!/1 returns the workspace with given id" do
      workspace = workspace_fixture()
      assert Workspaces.get_workspace!(workspace.id) == workspace
    end

    test "create_workspace/1 with valid data creates a workspace" do
      valid_attrs = %{domain: "some domain", logo_url: "some logo_url", name: "some name"}

      assert {:ok, %Workspace{} = workspace} = Workspaces.create_workspace(valid_attrs)
      assert workspace.domain == "some domain"
      assert workspace.logo_url == "some logo_url"
      assert workspace.name == "some name"
    end

    test "create_workspace/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Workspaces.create_workspace(@invalid_attrs)
    end

    test "update_workspace/2 with valid data updates the workspace" do
      workspace = workspace_fixture()
      update_attrs = %{domain: "some updated domain", logo_url: "some updated logo_url", name: "some updated name"}

      assert {:ok, %Workspace{} = workspace} = Workspaces.update_workspace(workspace, update_attrs)
      assert workspace.domain == "some updated domain"
      assert workspace.logo_url == "some updated logo_url"
      assert workspace.name == "some updated name"
    end

    test "update_workspace/2 with invalid data returns error changeset" do
      workspace = workspace_fixture()
      assert {:error, %Ecto.Changeset{}} = Workspaces.update_workspace(workspace, @invalid_attrs)
      assert workspace == Workspaces.get_workspace!(workspace.id)
    end

    test "delete_workspace/1 deletes the workspace" do
      workspace = workspace_fixture()
      assert {:ok, %Workspace{}} = Workspaces.delete_workspace(workspace)
      assert_raise Ecto.NoResultsError, fn -> Workspaces.get_workspace!(workspace.id) end
    end

    test "change_workspace/1 returns a workspace changeset" do
      workspace = workspace_fixture()
      assert %Ecto.Changeset{} = Workspaces.change_workspace(workspace)
    end
  end

  describe "memberships" do
    alias Sway.Workspaces.Membership

    import Sway.WorkspacesFixtures

    @invalid_attrs %{is_admin: nil}

    test "list_memberships/0 returns all memberships" do
      membership = membership_fixture()
      assert Workspaces.list_memberships() == [membership]
    end

    test "get_membership!/1 returns the membership with given id" do
      membership = membership_fixture()
      assert Workspaces.get_membership!(membership.id) == membership
    end

    test "create_membership/1 with valid data creates a membership" do
      valid_attrs = %{is_admin: true}

      assert {:ok, %Membership{} = membership} = Workspaces.create_membership(valid_attrs)
      assert membership.is_admin == true
    end

    test "create_membership/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Workspaces.create_membership(@invalid_attrs)
    end

    test "update_membership/2 with valid data updates the membership" do
      membership = membership_fixture()
      update_attrs = %{is_admin: false}

      assert {:ok, %Membership{} = membership} = Workspaces.update_membership(membership, update_attrs)
      assert membership.is_admin == false
    end

    test "update_membership/2 with invalid data returns error changeset" do
      membership = membership_fixture()
      assert {:error, %Ecto.Changeset{}} = Workspaces.update_membership(membership, @invalid_attrs)
      assert membership == Workspaces.get_membership!(membership.id)
    end

    test "delete_membership/1 deletes the membership" do
      membership = membership_fixture()
      assert {:ok, %Membership{}} = Workspaces.delete_membership(membership)
      assert_raise Ecto.NoResultsError, fn -> Workspaces.get_membership!(membership.id) end
    end

    test "change_membership/1 returns a membership changeset" do
      membership = membership_fixture()
      assert %Ecto.Changeset{} = Workspaces.change_membership(membership)
    end
  end
end
