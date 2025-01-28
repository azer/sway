defmodule Sway.InvitesFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Sway.Invites` context.
  """

  @doc """
  Generate a invite.
  """
  def invite_fixture(attrs \\ %{}) do
    {:ok, invite} =
      attrs
      |> Enum.into(%{
        email: "some email"
      })
      |> Sway.Invites.create_invite()

    invite
  end
end
