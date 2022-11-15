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
        ended_at: ~N[2022-11-13 14:54:00],
        message: "some message",
        started_at: ~N[2022-11-13 14:54:00],
        status: :focus
      })
      |> Bafa.Statuses.create_status()

    status
  end
end
