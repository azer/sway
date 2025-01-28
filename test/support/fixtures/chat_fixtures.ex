defmodule Sway.ChatFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Sway.Chat` context.
  """

  @doc """
  Generate a message.
  """
  def message_fixture(attrs \\ %{}) do
    {:ok, message} =
      attrs
      |> Enum.into(%{
        body: "some body",
        edited_at: ~U[2023-03-30 17:57:00Z],
        is_active: true
      })
      |> Sway.Chat.create_message()

    message
  end
end
