using CRMBackend.Application.Common.Interfaces.Repositories;
using CRMBackend.Domain.Entities;

namespace CRMBackend.Application.TodoLists.Commands.UpdateTodoList;

public class UpdateTodoListCommandValidator : AbstractValidator<UpdateTodoListCommand>
{
    private readonly IReadRepository<TodoList> _repository;

    public UpdateTodoListCommandValidator(IReadRepository<TodoList> repository)
    {
        _repository = repository;
        
        RuleFor(v => v.Id)
            .NotNull().WithMessage("Id is required.")
            .GreaterThan(0).WithMessage("Id must be greater than 0.");

        RuleFor(v => v.Title)
            .NotNull().WithMessage("Title is required.")
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(200).WithMessage("Title must not exceed 200 characters.")
            .MustAsync(BeUniqueTitle)
                .WithMessage("'{PropertyName}' must be unique.")
                .WithErrorCode("Unique");
    }

    private async Task<bool> BeUniqueTitle(UpdateTodoListCommand model, string? title, CancellationToken cancellationToken)
    {
        return !await _repository.GetQueryableNoTracking()
            .Where(l => l.Id != model.Id)
            .AnyAsync(l => l.Title == title, cancellationToken);
    }
}
