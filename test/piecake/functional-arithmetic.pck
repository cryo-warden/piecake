module someModule;

watch := import 'sourceWatch.watch';
unwatch := import 'sourceWatch.unwatch';

add := \x\y(x+y);
sub := \x\y(x-y);
mul := \x\y(x*y);
div := \x\y(x/y);

watch \{
  doStuff(@);
  @stop();
};

return someExports;

end module someOtherExports;