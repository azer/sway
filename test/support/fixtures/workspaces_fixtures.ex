defmodule Sway.WorkspacesFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Sway.Workspaces` context.
  """

  @doc """
  Generate a workspace.
  """
  def workspace_fixture(attrs \\ %{}) do
    {:ok, workspace} =
      attrs
      |> Enum.into(%{
        domain: "some domain",
        logo_url: "some logo_url",
        name: "some name"
      })
      |> Sway.Workspaces.create_workspace()

    workspace
  end

  @doc """
  Generate a membership.
  """
  def membership_fixture(attrs \\ %{}) do
    {:ok, membership} =
      attrs
      |> Enum.into(%{
        is_admin: true
      })
      |> Sway.Workspaces.create_membership()

    membership
  end
end
