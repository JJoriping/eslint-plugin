import { ESLintUtils } from "@typescript-eslint/utils";

const desirousnessPattern = /집에\s*가고\s*싶다/;

export default ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: "problem",
    messages: {
      'default': "집에 가기까지 {{left}} 남았습니다... 🥺"
    },
    schema: [{
      type: "object",
      properties: {
        hourFrom: { type: "integer" },
        hourTo: { type: "integer" },
        ignoreWeekend: { type: "boolean" }
      }
    }]
  },
  defaultOptions: [{
    hourFrom: 9,
    hourTo: 18,
    ignoreWeekend: true
  }],
  create(context, [{ hourFrom, hourTo, ignoreWeekend }]){
    const now = new Date();
    const sourceCode = context.getSourceCode();

    const weekend = now.getDay() % 6 === 0;
    const inRange = hourFrom <= now.getHours() && now.getHours() < hourTo;

    if(ignoreWeekend && weekend){
      return {};
    }
    if(!inRange){
      return {};
    }
    return {
      Program: () => {
        const left = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hourTo).getTime() - now.getTime();
        const leftMinutes = Math.floor(left / 60000);

        for(const v of sourceCode.getAllComments()){
          if(!desirousnessPattern.test(v.value)){
            continue;
          }
          context.report({
            node: v,
            messageId: "default",
            data: {
              left: leftMinutes > 60
                ? `${Math.floor(leftMinutes / 60)}시간 ${leftMinutes % 60}분`
                : leftMinutes > 0
                ? `${leftMinutes}분`
                : "1분도 안"
            }
          });
        }
      }
    };
  }
});