defmodule Bafa.StatusesFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Bafa.Statuses` context.
  """

  @doc """
  Generate a status.
  """
  def status_fixture(attrs \\ %{}) do
    {:ok, status} =
      attrs
      |> Enum.into(%{
        message: "some message",
        status: :focus
      })
      |> Bafa.Statuses.create_status()

    status
  end
end
