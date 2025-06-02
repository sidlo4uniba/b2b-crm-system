using FluentValidation;

namespace CRMBackend.Application.TodoLists.Commands.UpdateTodoListMaxItems;

public class UpdateTodoListMaxItemsCommandValidator : AbstractValidator<UpdateTodoListMaxItemsCommand>
{
    public UpdateTodoListMaxItemsCommandValidator()
    {
        RuleFor(v => v.Id)
            .NotEmpty()
            .WithMessage("Id is required.")
            .GreaterThan(0)
            .WithMessage("Id must be greater than 0.");

        RuleFor(v => v.MaxItems)
            .GreaterThan(0)
            .WithMessage("Max items must be greater than 0.");
    }
} 