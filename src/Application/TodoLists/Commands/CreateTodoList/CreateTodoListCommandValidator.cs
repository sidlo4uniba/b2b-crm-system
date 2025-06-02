using FluentValidation;
using CRMBackend.Application.Common.Interfaces.Repositories;
using CRMBackend.Domain.Entities;

namespace CRMBackend.Application.TodoLists.Commands.CreateTodoList;

public class CreateTodoListCommandValidator : AbstractValidator<CreateTodoListCommand>
{
    private readonly IReadRepository<TodoList> _repository;

    public CreateTodoListCommandValidator(IReadRepository<TodoList> repository)
    {
        _repository = repository;

        RuleFor(v => v.Title)
            .NotNull().WithMessage("Title is required.")
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(200).WithMessage("Title must not exceed 200 characters.")
            .MustAsync(BeUniqueTitle)
                .WithMessage("'{PropertyName}' must be unique.")
                .WithErrorCode("Unique");
    }

    private async Task<bool> BeUniqueTitle(string? title, CancellationToken cancellationToken)
    {
        return !await _repository.GetQueryableNoTracking()
            .AnyAsync(t => t.Title == title, cancellationToken);
    }
}
