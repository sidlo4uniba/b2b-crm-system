using System.Diagnostics;
using MediatR;
using CRMBackend.Application.Common.Interfaces.Repositories;
using CRMBackend.Domain.Entities;
using CRMBackend.Domain.Enums;
using Ardalis.GuardClauses;

namespace CRMBackend.Application.TodoLists.Commands.UpdateTodoItem;

public record UpdateTodoItemCommand : IRequest
{
    public required int ListId { get; init; }
    public required int ItemId { get; init; }
    public required string Title { get; init; }
    public string? Note { get; init; }
    public PriorityLevel? Priority { get; init; }
    public DateTime? Reminder { get; init; }
    public required bool Done { get; init; }
}

public class UpdateTodoItemCommandHandler : IRequestHandler<UpdateTodoItemCommand>
{
    private readonly IWriteRepository<TodoList> _repository;

    public UpdateTodoItemCommandHandler(IWriteRepository<TodoList> repository)
    {
        _repository = repository;
    }

    public async Task Handle(UpdateTodoItemCommand request, CancellationToken cancellationToken)
    {
        var todoList = await _repository.GetByIdAsync(request.ListId, cancellationToken);
        Guard.Against.NotFound(request.ListId, todoList);

        var todoItem = todoList.Items.FirstOrDefault(i => i.Id == request.ItemId);
        Guard.Against.NotFound(request.ItemId, todoItem);

        todoItem.Title = request.Title;
        todoItem.Note = request.Note;
        todoItem.Priority = request.Priority;
        todoItem.Reminder = request.Reminder;
        todoItem.Done = request.Done;

        await _repository.SaveAsync(cancellationToken);
    }
} 
