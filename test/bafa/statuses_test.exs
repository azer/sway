defmodule Bafa.StatusesTest do
  use Bafa.DataCase

  alias Bafa.Statuses

  describe "statuses" do
    alias Bafa.Statuses.Status

    import Bafa.StatusesFixtures

    @invalid_attrs %{message: nil, status: nil}

    test "list_statuses/0 returns all statuses" do
      status = status_fixture()
      assert Statuses.list_statuses() == [status]
    end

    test "get_status!/1 returns the status with given id" do
      status = status_fixture()
      assert Statuses.get_status!(status.id) == status
    end

    test "create_status/1 with valid data creates a status" do
      valid_attrs = %{message: "some message", status: :focus}

      assert {:ok, %Status{} = status} = Statuses.create_status(valid_attrs)
      assert status.message == "some message"
      assert status.status == :focus
    end

    test "create_status/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Statuses.create_status(@invalid_attrs)
    end

    test "update_status/2 with valid data updates the status" do
      status = status_fixture()
      update_attrs = %{message: "some updated message", status: :active}

      assert {:ok, %Status{} = status} = Statuses.update_status(status, update_attrs)
      assert status.message == "some updated message"
      assert status.status == :active
    end

    test "update_status/2 with invalid data returns error changeset" do
      status = status_fixture()
      assert {:error, %Ecto.Changeset{}} = Statuses.update_status(status, @invalid_attrs)
      assert status == Statuses.get_status!(status.id)
    end

    test "delete_status/1 deletes the status" do
      status = status_fixture()
      assert {:ok, %Status{}} = Statuses.delete_status(status)
      assert_raise Ecto.NoResultsError, fn -> Statuses.get_status!(status.id) end
    end

    test "change_status/1 returns a status changeset" do
      status = status_fixture()
      assert %Ecto.Changeset{} = Statuses.change_status(status)
    end
  end
end
