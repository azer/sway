defmodule Bafa.AccountsFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Bafa.Accounts` context.
  """

  def unique_user_email, do: "user#{System.unique_integer()}@example.com"
  def valid_user_password, do: "hello world!"

  def valid_user_attributes(attrs \\ %{}) do
    Enum.into(attrs, %{
      email: unique_user_email(),
      password: valid_user_password()
    })
  end

  def user_fixture(attrs \\ %{}) do
    {:ok, user} =
      attrs
      |> valid_user_attributes()
      |> Bafa.Accounts.register_user()

    user
  end

  def extract_user_token(fun) do
    {:ok, captured_email} = fun.(&"[TOKEN]#{&1}[TOKEN]")
    [_, token | _] = String.split(captured_email.text_body, "[TOKEN]")
    token
  end

  @doc """
  Generate a org.
  """
  def org_fixture(attrs \\ %{}) do
    {:ok, org} =
      attrs
      |> Enum.into(%{
        domain: "some domain",
        name: "some name"
      })
      |> Bafa.Accounts.create_org()

    org
  end
end
