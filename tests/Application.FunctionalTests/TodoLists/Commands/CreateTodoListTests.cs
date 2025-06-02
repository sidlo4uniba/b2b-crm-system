using CRMBackend.Application.Common.Exceptions;
using CRMBackend.Application.TodoLists.Commands.CreateTodoList;
using CRMBackend.Domain.Entities;

namespace CRMBackend.Application.FunctionalTests.TodoLists.Commands;

using static Testing;

public class CreateTodoListTests : BaseTestFixture
{
    [Test]
    public async Task ShouldRequireUniqueTitle()
    {
        await SendAsync(new CreateTodoListCommand
        {
            Title = "Shopping"
        });

        var command = new CreateTodoListCommand
        {
            Title = "Shopping"
        };

        await FluentActions.Invoking(() =>
            SendAsync(command)).Should().ThrowAsync<ValidationException>();
    }

    [Test]
    public async Task ShouldCreateTodoList()
    {
        var command = new CreateTodoListCommand
        {
            Title = "Tasks"
        };

        var id = await SendAsync(command);

        var list = await FindAsync<TodoList>(id);

        list.Should().NotBeNull();
        list!.Title.Should().Be(command.Title);
        list.VytvoreneDna.Should().BeCloseTo(DateTime.Now, TimeSpan.FromMilliseconds(10000));
    }
}
