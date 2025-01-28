defmodule Sway.ChatTest do
  use Sway.DataCase

  alias Sway.Chat

  describe "messages" do
    alias Sway.Chat.Message

    import Sway.ChatFixtures

    @invalid_attrs %{body: nil, edited_at: nil, is_active: nil}

    test "list_messages/0 returns all messages" do
      message = message_fixture()
      assert Chat.list_messages() == [message]
    end

    test "get_message!/1 returns the message with given id" do
      message = message_fixture()
      assert Chat.get_message!(message.id) == message
    end

    test "create_message/1 with valid data creates a message" do
      valid_attrs = %{body: "some body", edited_at: ~U[2023-03-30 17:57:00Z], is_active: true}

      assert {:ok, %Message{} = message} = Chat.create_message(valid_attrs)
      assert message.body == "some body"
      assert message.edited_at == ~U[2023-03-30 17:57:00Z]
      assert message.is_active == true
    end

    test "create_message/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Chat.create_message(@invalid_attrs)
    end

    test "update_message/2 with valid data updates the message" do
      message = message_fixture()
      update_attrs = %{body: "some updated body", edited_at: ~U[2023-03-31 17:57:00Z], is_active: false}

      assert {:ok, %Message{} = message} = Chat.update_message(message, update_attrs)
      assert message.body == "some updated body"
      assert message.edited_at == ~U[2023-03-31 17:57:00Z]
      assert message.is_active == false
    end

    test "update_message/2 with invalid data returns error changeset" do
      message = message_fixture()
      assert {:error, %Ecto.Changeset{}} = Chat.update_message(message, @invalid_attrs)
      assert message == Chat.get_message!(message.id)
    end

    test "delete_message/1 deletes the message" do
      message = message_fixture()
      assert {:ok, %Message{}} = Chat.delete_message(message)
      assert_raise Ecto.NoResultsError, fn -> Chat.get_message!(message.id) end
    end

    test "change_message/1 returns a message changeset" do
      message = message_fixture()
      assert %Ecto.Changeset{} = Chat.change_message(message)
    end
  end
end
